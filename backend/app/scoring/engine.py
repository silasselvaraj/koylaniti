from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import log_event
from app.id_generator import next_id
from app.models import Case, ComplianceFinding, Mine
from app.scoring.config import DOMAIN_WEIGHTS, band_for_score

SEVERITY_RANK = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}


def score_domain(findings: list[dict]) -> float:
    """findings: list of {"score_impact": float, ...}. Pure function, no DB."""
    score = 100.0 - sum(f["score_impact"] for f in findings)
    return max(0.0, min(100.0, score))


def compute_score_breakdown(findings_by_domain: dict[str, list[dict]]) -> dict:
    """Pure function: domain -> list of finding dicts, returns the full explainable breakdown."""
    domains: dict[str, dict] = {}
    overall = 0.0
    for domain, weight in DOMAIN_WEIGHTS.items():
        findings = findings_by_domain.get(domain, [])
        domain_score = score_domain(findings)
        domains[domain] = {"score": domain_score, "weight": weight, "findings": findings}
        overall += domain_score * weight
    return {"overall": round(overall, 1), "band": band_for_score(overall), "domains": domains}


def compute_mine_score(db: Session, mine_id: str) -> dict:
    """DB-integrated: reads OPEN findings for a mine, scores it, persists the cache on
    Mine, and auto-creates a case if the mine just crossed into RED."""
    mine = db.get(Mine, mine_id)
    if mine is None:
        raise ValueError(f"Unknown mine {mine_id}")

    open_findings = db.scalars(
        select(ComplianceFinding).where(
            ComplianceFinding.mine_id == mine_id, ComplianceFinding.status == "OPEN"
        )
    ).all()

    findings_by_domain: dict[str, list[dict]] = {}
    for f in open_findings:
        findings_by_domain.setdefault(f.domain, []).append(
            {
                "id": f.id,
                "rule_id": f.rule_id,
                "severity": f.severity,
                "description": f.description,
                "score_impact": f.score_impact,
                "source_type": f.source_type,
            }
        )

    breakdown = compute_score_breakdown(findings_by_domain)

    mine.current_score = breakdown["overall"]
    mine.current_band = breakdown["band"]
    mine.last_scored_at = datetime.now(timezone.utc)

    case_id = None
    if breakdown["band"] == "RED":
        existing_open_case = db.scalars(
            select(Case).where(Case.mine_id == mine_id, Case.status != "CLOSED")
        ).first()
        if existing_open_case is None:
            worst_severity = max(
                (f.severity for f in open_findings), key=lambda s: SEVERITY_RANK.get(s, 0), default="LOW"
            )
            case_id = next_id(db, Case, Case.id, "CASE")
            case = Case(
                id=case_id,
                mine_id=mine_id,
                status="DETECTED",
                severity=worst_severity,
                title=f"{len(open_findings)} open compliance finding(s) — score {breakdown['overall']} ({breakdown['band']})",
                created_by="SYSTEM",
            )
            db.add(case)
            db.flush()  # case row must exist before findings can reference it via case_id FK
            for f in open_findings:
                f.case_id = case_id
            log_event(db, "case_auto_created", mine_id=mine_id, case_id=case_id, detail=f"band={breakdown['band']}")
        else:
            case_id = existing_open_case.id

    log_event(db, "mine_score_computed", mine_id=mine_id, detail=f"overall={breakdown['overall']} band={breakdown['band']}")
    db.commit()

    breakdown["mine_id"] = mine_id
    breakdown["case_id"] = case_id
    return breakdown
