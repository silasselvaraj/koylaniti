from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.document_extractor import run_document_extraction
from app.audit import log_event
from app.database import get_db
from app.deps import require_mine_manager, require_user
from app.id_generator import next_id
from app.models import Document, User
from app.schemas import DocumentOut
from app.scoping import scope_by_mine_fk

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024
DOC_TYPES = (
    "Environmental Clearance",
    "Forest Clearance",
    "Mining Plan Approval",
    "Consent to Operate",
    "Safety Certificate",
    "Other",
)


@router.post("", response_model=DocumentOut)
async def upload_document(
    background_tasks: BackgroundTasks,
    doc_type: str = Form(...),
    raw_text: str = Form(""),
    file: UploadFile | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_mine_manager),
):
    if user.mine_id is None:
        raise HTTPException(400, "User has no assigned mine")
    if doc_type not in DOC_TYPES:
        doc_type = "Other"

    if file is not None:
        data = await file.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(413, "File too large (10MB max)")
        filename, content_type = file.filename or "document", file.content_type or "application/octet-stream"
    else:
        data, filename, content_type = b"", "pasted-text.txt", "text/plain"

    doc_id = next_id(db, Document, Document.id, "DOC")
    doc = Document(
        id=doc_id,
        mine_id=user.mine_id,
        uploaded_by_user_id=user.id,
        doc_type=doc_type,
        filename=filename,
        content_type=content_type,
        size=len(data),
        data=data,
        raw_text=raw_text or None,
        extraction_status="PENDING",
    )
    db.add(doc)
    log_event(db, "document_uploaded", mine_id=user.mine_id, user_id=user.id, detail=doc_id)
    db.commit()

    if raw_text:
        background_tasks.add_task(run_document_extraction, doc_id)

    return doc


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = scope_by_mine_fk(user, Document, select(Document).where(Document.id == document_id))
    doc = db.scalars(stmt).first()
    if doc is None:
        raise HTTPException(404, "Document not found")
    return doc


@router.get("/{document_id}/file")
def get_document_file(document_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = scope_by_mine_fk(user, Document, select(Document).where(Document.id == document_id))
    doc = db.scalars(stmt).first()
    if doc is None:
        raise HTTPException(404, "Document not found")
    return Response(
        content=doc.data,
        media_type=doc.content_type,
        headers={"Content-Disposition": f'inline; filename="{doc.filename}"'},
    )


@router.get("/mine/{mine_id}", response_model=list[DocumentOut])
def list_mine_documents(mine_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = scope_by_mine_fk(user, Document, select(Document).where(Document.mine_id == mine_id))
    return db.scalars(stmt.order_by(Document.created_at.desc())).all()
