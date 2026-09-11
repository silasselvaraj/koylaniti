from datetime import date, datetime

from app.ai.ollama_client import call_ollama

DOC_TYPES = (
    "Environmental Clearance",
    "Forest Clearance",
    "Mining Plan Approval",
    "Consent to Operate",
    "Safety Certificate",
    "Other",
)

SYSTEM_PROMPT = """You extract structured fields from a coal-mine regulatory document's text.
Respond with ONLY a JSON object, no other text, matching exactly this shape:
{
  "doc_type": one of ["Environmental Clearance", "Forest Clearance", "Mining Plan Approval",
                       "Consent to Operate", "Safety Certificate", "Other"],
  "permit_number": string or null,
  "issue_date": "YYYY-MM-DD" or null,
  "expiry_date": "YYYY-MM-DD" or null,
  "issuing_authority": string or null
}
Never invent a date or number that is not present in the text. Use null when unsure."""


def _build_prompt(raw_text: str) -> str:
    return f'{SYSTEM_PROMPT}\n\nDOCUMENT TEXT:\n"""\n{raw_text}\n"""\n\nJSON:'


def _parse_date(value) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.strptime(value.strip(), "%Y-%m-%d").date()
    except ValueError:
        return None


def _validate_and_fill(parsed: dict) -> dict:
    """Force every expected key to exist with the right type, regardless of what the
    small model actually returned - the same defensive pattern as the reference project's
    ai_analyzer.py, since a 0.5b model frequently returns a partial or malformed shape."""
    doc_type = parsed.get("doc_type")
    if doc_type not in DOC_TYPES:
        doc_type = "Other"
    return {
        "doc_type": doc_type,
        "permit_number": parsed.get("permit_number") if isinstance(parsed.get("permit_number"), str) else None,
        "issue_date": _parse_date(parsed.get("issue_date")),
        "expiry_date": _parse_date(parsed.get("expiry_date")),
        "issuing_authority": parsed.get("issuing_authority") if isinstance(parsed.get("issuing_authority"), str) else None,
    }


def analyze_document(raw_text: str) -> dict:
    parsed = call_ollama(_build_prompt(raw_text))
    return _validate_and_fill(parsed)


# --- background task entrypoint -------------------------------------------------

RULE_FOR_DOC_TYPE = {
    "Environmental Clearance": "CMR-STAT-001",
    "Forest Clearance": "CMR-STAT-002",
    "Mining Plan Approval": "CMR-STAT-003",
    "Consent to Operate": "CMR-STAT-004",
}


def run_document_extraction(document_id: str) -> None:
    """Background task: own DB session, since the request session is gone by the time
    BackgroundTasks actually runs."""
    from app.audit import log_event
    from app.database import SessionLocal
    from app.models import ComplianceFinding, Document, Mine, Rule
    from app.notifications_helpers import notify_oversight
    from app.scoring.config import SEVERITY_POINTS
    from app.scoring.engine import compute_mine_score

    db = SessionLocal()
    try:
        doc = db.get(Document, document_id)
        if doc is None or not doc.raw_text:
            return
        try:
            result = analyze_document(doc.raw_text)
        except RuntimeError as e:
            doc.extraction_status = "FAILED"
            log_event(db, "document_extraction_failed", mine_id=doc.mine_id, detail=str(e)[:500])
            db.commit()
            return

        doc.doc_type = result["doc_type"]
        doc.extracted_permit_number = result["permit_number"]
        doc.extracted_issue_date = result["issue_date"]
        doc.extracted_expiry_date = result["expiry_date"]
        doc.extraction_status = "DONE"
        log_event(db, "document_extraction_completed", mine_id=doc.mine_id, detail=document_id)

        rule_id = RULE_FOR_DOC_TYPE.get(doc.doc_type)
        if rule_id and doc.extracted_expiry_date and doc.extracted_expiry_date < date.today():
            rule = db.get(Rule, rule_id)
            if rule:
                existing = (
                    db.query(ComplianceFinding)
                    .filter_by(mine_id=doc.mine_id, source_type="DOCUMENT", source_id=document_id, status="OPEN")
                    .first()
                )
                if existing is None:
                    finding = ComplianceFinding(
                        mine_id=doc.mine_id,
                        rule_id=rule.id,
                        domain=rule.domain,
                        source_type="DOCUMENT",
                        source_id=document_id,
                        detail={"expiry_date": doc.extracted_expiry_date.isoformat(), "doc_type": doc.doc_type},
                        severity=rule.severity,
                        status="OPEN",
                        description=f"{doc.doc_type} ({document_id}) expired {doc.extracted_expiry_date.isoformat()}",
                        score_impact=SEVERITY_POINTS.get(rule.severity, 15),
                    )
                    db.add(finding)
                    if rule.severity == "CRITICAL":
                        mine = db.get(Mine, doc.mine_id)
                        notify_oversight(
                            db, mine, f"CRITICAL finding detected at {mine.name}: {finding.description}"
                        )
        db.commit()
        compute_mine_score(db, doc.mine_id)
    finally:
        db.close()
