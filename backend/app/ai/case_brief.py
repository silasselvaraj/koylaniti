from app.ai.ollama_client import call_ollama

SYSTEM_PROMPT = """You write a short, neutral case brief for a DGMS officer reviewing a coal-mine
compliance case. You are given a JSON list of structured compliance findings. Write 2-3 sentences
summarizing what was found and why the case was opened. Never invent a fact that is not present in
the findings - only describe what is there. Respond with ONLY a JSON object of this shape:
{"brief": "..."}"""


def _build_prompt(findings: list[dict]) -> str:
    return f"{SYSTEM_PROMPT}\n\nFINDINGS:\n{findings}\n\nJSON:"


def generate_case_brief(findings: list[dict]) -> str:
    try:
        parsed = call_ollama(_build_prompt(findings))
    except RuntimeError:
        # AI only explains, never blocks case creation if the model is unreachable/malformed.
        severities = ", ".join(sorted({f.get("severity", "") for f in findings}))
        return f"{len(findings)} open finding(s) ({severities}) require review."
    brief = parsed.get("brief")
    if not isinstance(brief, str) or not brief.strip():
        return f"{len(findings)} open finding(s) require review."
    return brief.strip()


def run_case_brief_generation(case_id: str) -> None:
    from app.database import SessionLocal
    from app.models import Case, ComplianceFinding

    db = SessionLocal()
    try:
        case = db.get(Case, case_id)
        if case is None:
            return
        findings = (
            db.query(ComplianceFinding)
            .filter_by(case_id=case_id)
            .all()
        )
        findings_payload = [
            {"domain": f.domain, "severity": f.severity, "description": f.description}
            for f in findings
        ]
        case.ai_brief = generate_case_brief(findings_payload)
        db.commit()
    finally:
        db.close()
