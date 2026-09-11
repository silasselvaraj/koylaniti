from app.ai.ollama_client import call_ollama

SYSTEM_PROMPT = """You write a short, neutral summary for a DGMS officer triaging a public complaint
about a coal mine. You are given the complainant's raw text. Write 2-3 sentences summarizing what is
being alleged. Never invent a fact that is not present in the text, and never add your own judgement
about whether the complaint is credible - only describe what was said. Respond with ONLY a JSON
object of this shape: {"summary": "..."}"""


def _build_prompt(description: str) -> str:
    return f'{SYSTEM_PROMPT}\n\nCOMPLAINT TEXT:\n"""\n{description}\n"""\n\nJSON:'


def generate_complaint_summary(description: str) -> str:
    try:
        parsed = call_ollama(_build_prompt(description))
    except RuntimeError:
        # AI only explains, never blocks triage if the model is unreachable/malformed.
        return description[:200] + ("..." if len(description) > 200 else "")
    summary = parsed.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        return description[:200] + ("..." if len(description) > 200 else "")
    return summary.strip()


def run_complaint_summary(complaint_id: str) -> None:
    """Background task: own DB session, since the request session is gone by the time
    BackgroundTasks actually runs."""
    from app.database import SessionLocal
    from app.models import PublicComplaint

    db = SessionLocal()
    try:
        complaint = db.get(PublicComplaint, complaint_id)
        if complaint is None:
            return
        complaint.ai_summary = generate_complaint_summary(complaint.description)
        db.commit()
    finally:
        db.close()
