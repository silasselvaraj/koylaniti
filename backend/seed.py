"""Wipes and reseeds the demo database. Run with: .venv/Scripts/python.exe seed.py

Produces exactly the dataset the judge demo script depends on:
- MINE-1003 (Chhattisgarh) is the "hero" RED mine: 1 expired EC doc, 2 safety findings,
  1 satellite anomaly, and a pre-existing DETECTED/TRIAGED (unassigned) case ready for the
  live "Assign Case" demo step.
- MINE-1007 (Telangana) is a second RED mine, lighter/different finding mix, case already
  ASSIGNED - proves the pattern generalizes without live-triggering it.
- 3 GREEN, 3 YELLOW mines with no/moderate findings.
- One historical CLOSED case on a GREEN mine, one baseline completed inspection on a GREEN
  mine, and one valid (non-expired) document - so no view in the demo is empty-state-only.
"""

from datetime import date, datetime, timedelta, timezone

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.id_generator import next_id
from app.models import Case, ComplianceFinding, Document, Inspection, Mine, Rule, User
from app.satellite.mock_data import MOCK_SATELLITE_FINDINGS
from app.scoring.config import SEVERITY_POINTS
from app.scoring.engine import compute_mine_score

print("Dropping and recreating all tables...")
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

db = SessionLocal()

# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

RULES = [
    dict(id="CMR-STAT-001", domain="STATUTORY", source="Environment Protection Act 1986 (EC conditions)",
         description="Environmental Clearance must not be expired.", check_type="DATE",
         threshold={"grace_days": 0}, severity="CRITICAL", evidence_required="Document"),
    dict(id="CMR-STAT-002", domain="STATUTORY", source="Forest (Conservation) Act 1980",
         description="Forest Clearance must not be expired.", check_type="DATE",
         threshold={"grace_days": 0}, severity="HIGH", evidence_required="Document"),
    dict(id="CMR-STAT-003", domain="STATUTORY", source="MCDR 2017 Reg 14 / CMR 2017",
         description="Mining Plan / Scheme approval must be current.", check_type="DATE",
         threshold={"grace_days": 0}, severity="HIGH", evidence_required="Document"),
    dict(id="CMR-STAT-004", domain="STATUTORY", source="Water/Air Act - SPCB Consent to Operate",
         description="Consent to Operate must not be expired.", check_type="DATE",
         threshold={"grace_days": 0}, severity="MEDIUM", evidence_required="Document"),
    dict(id="CMR-SAFE-001", domain="SAFETY", source="Mines Act 1952 S.19 / CMR 2017",
         description="Statutory safety inspection must not be overdue.", check_type="INSPECTION",
         threshold={"max_days_since_inspection": 90}, severity="HIGH", evidence_required="Inspection"),
    dict(id="CMR-SAFE-002", domain="SAFETY", source="CMR 2017 Reg 108 (ventilation)",
         description="Ventilation / gas monitoring checklist item must pass.", check_type="BOOLEAN",
         threshold={}, severity="CRITICAL", evidence_required="Inspection photo"),
    dict(id="CMR-SAFE-003", domain="SAFETY", source="CMR 2017 - emergency preparedness",
         description="Fire-fighting / emergency equipment must be available.", check_type="BOOLEAN",
         threshold={}, severity="MEDIUM", evidence_required="Inspection photo"),
    dict(id="CMR-ENV-001", domain="ENVIRONMENTAL", source="EC boundary conditions",
         description="Vegetation loss must not extend beyond the approved lease boundary.", check_type="GEO",
         threshold={"max_ndvi_loss_pct_outside_boundary": 5}, severity="CRITICAL", evidence_required="Satellite"),
    dict(id="CMR-ENV-002", domain="ENVIRONMENTAL", source="MCDR 2017 Reg 32 (reclamation)",
         description="Progressive reclamation must be at least 70% of plan.", check_type="NUMERIC",
         threshold={"min_reclamation_pct": 70}, severity="HIGH", evidence_required="Inspection/Satellite"),
    dict(id="CMR-OPS-001", domain="OPERATIONAL", source="MMDR Act - statutory returns",
         description="Production/statutory returns must be filed on time.", check_type="BOOLEAN",
         threshold={}, severity="LOW", evidence_required="Document"),
]
for r in RULES:
    db.add(Rule(**r))
db.commit()
print(f"Seeded {len(RULES)} rules.")

# ---------------------------------------------------------------------------
# Mines
# ---------------------------------------------------------------------------

MINES = [
    dict(id="MINE-1001", name="Jharia Central Colliery", state="Jharkhand", district="Dhanbad",
         latitude=23.7397, longitude=86.4197),
    dict(id="MINE-1002", name="Talcher Coalfield East", state="Odisha", district="Angul",
         latitude=20.9500, longitude=85.2167),
    dict(id="MINE-1003", name="Korba West Opencast Mine", state="Chhattisgarh", district="Korba",
         latitude=22.3595, longitude=82.7501),
    dict(id="MINE-1004", name="Raniganj Coalfield North", state="West Bengal", district="Paschim Bardhaman",
         latitude=23.6167, longitude=87.1167),
    dict(id="MINE-1005", name="Singrauli Main Basin", state="Madhya Pradesh", district="Singrauli",
         latitude=24.1997, longitude=82.6747),
    dict(id="MINE-1006", name="Sohagpur Block B", state="Madhya Pradesh", district="Shahdol",
         latitude=23.1000, longitude=81.3500),
    dict(id="MINE-1007", name="Ramagundam Opencast II", state="Telangana", district="Peddapalli",
         latitude=18.7500, longitude=79.4500),
    dict(id="MINE-1008", name="Godavari Valley Colliery", state="Telangana", district="Bhadradri Kothagudem",
         latitude=17.8500, longitude=80.6167),
]
for m in MINES:
    db.add(Mine(**m, boundary_polygon=[]))
db.commit()
print(f"Seeded {len(MINES)} mines.")

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

DEMO_PASSWORD = "demo-2026"

users_to_create = [
    dict(username="admin", role="MINISTRY_ADMIN", full_name="Ministry Admin", jurisdiction_state=None, mine_id=None),
    dict(username="dgms_east", role="DGMS_OFFICER", full_name="DGMS Officer (East)", jurisdiction_state="Chhattisgarh", mine_id=None),
    dict(username="dgms_south", role="DGMS_OFFICER", full_name="DGMS Officer (South)", jurisdiction_state="Telangana", mine_id=None),
    dict(username="inspector1", role="FIELD_INSPECTOR", full_name="Ramesh Patil", jurisdiction_state=None, mine_id=None),
    dict(username="inspector2", role="FIELD_INSPECTOR", full_name="Sunita Rao", jurisdiction_state=None, mine_id=None),
    dict(username="inspector3", role="FIELD_INSPECTOR", full_name="Arjun Nair", jurisdiction_state=None, mine_id=None),
]
for i, mine in enumerate(MINES, start=1):
    users_to_create.append(
        dict(username=f"manager{i}", role="MINE_MANAGER", full_name=f"Manager - {mine['name']}",
             jurisdiction_state=None, mine_id=mine["id"])
    )

user_by_username = {}
for u in users_to_create:
    user = User(password_hash=hash_password(DEMO_PASSWORD), **u)
    db.add(user)
    db.flush()
    user_by_username[u["username"]] = user
    if u["role"] == "MINE_MANAGER":
        mine = db.get(Mine, u["mine_id"])
        mine.manager_user_id = user.id
db.commit()
print(f"Seeded {len(users_to_create)} users (all password: {DEMO_PASSWORD}).")

# ---------------------------------------------------------------------------
# Helper to add a finding
# ---------------------------------------------------------------------------


def add_finding(mine_id, rule_id, source_type, description, source_id=None, detail=None):
    rule = db.get(Rule, rule_id)
    db.add(
        ComplianceFinding(
            mine_id=mine_id,
            rule_id=rule_id,
            domain=rule.domain,
            source_type=source_type,
            source_id=source_id,
            detail=detail or {},
            severity=rule.severity,
            status="OPEN",
            description=description,
            score_impact=SEVERITY_POINTS[rule.severity],
        )
    )


# ---------------------------------------------------------------------------
# Hero RED mine: MINE-1003
# ---------------------------------------------------------------------------

expired_date = date.today() - timedelta(days=45)
issue_date = expired_date - timedelta(days=365 * 5)

hero_doc_id = next_id(db, Document, Document.id, "DOC")
db.add(
    Document(
        id=hero_doc_id,
        mine_id="MINE-1003",
        uploaded_by_user_id=user_by_username["manager3"].id,
        doc_type="Environmental Clearance",
        filename="EC-korba-west.txt",
        content_type="text/plain",
        size=0,
        data=b"",
        raw_text=(
            "Environmental Clearance No. J-11015/45/2019-IA.II(M). Issued to Korba West Opencast Mine, "
            f"Chhattisgarh. Date of issue: {issue_date.isoformat()}. Valid until: {expired_date.isoformat()}. "
            "Issuing Authority: Ministry of Environment, Forest and Climate Change."
        ),
        extracted_issue_date=issue_date,
        extracted_expiry_date=expired_date,
        extracted_permit_number="J-11015/45/2019-IA.II(M)",
        extraction_status="DONE",
    )
)
db.commit()

add_finding(
    "MINE-1003", "CMR-STAT-001", "DOCUMENT",
    f"Environmental Clearance ({hero_doc_id}) expired {expired_date.isoformat()}",
    source_id=hero_doc_id, detail={"expiry_date": expired_date.isoformat()},
)
add_finding(
    "MINE-1003", "CMR-SAFE-001", "INSPECTION",
    "Statutory safety inspection overdue by 34 days (last inspection >90 days ago).",
    detail={"days_overdue": 34},
)
add_finding(
    "MINE-1003", "CMR-SAFE-002", "INSPECTION",
    "Ventilation/gas monitoring checklist item failed at last recorded inspection.",
    detail={"checklist_item": "ventilation_gas_monitoring", "passed": False},
)

hero_sat = next(f for f in MOCK_SATELLITE_FINDINGS if f["mine_id"] == "MINE-1003")
add_finding(
    "MINE-1003", hero_sat["rule_id"], "SATELLITE", hero_sat["description"],
    detail={"ndvi_loss_pct": hero_sat["ndvi_loss_pct"], "before_date": hero_sat["before_date"], "after_date": hero_sat["after_date"]},
)
db.commit()

# ---------------------------------------------------------------------------
# Second RED mine: MINE-1007 (different finding mix)
# ---------------------------------------------------------------------------

expired_date_2 = date.today() - timedelta(days=12)
doc2_id = next_id(db, Document, Document.id, "DOC")
db.add(
    Document(
        id=doc2_id, mine_id="MINE-1007", uploaded_by_user_id=user_by_username["manager7"].id,
        doc_type="Forest Clearance", filename="FC-ramagundam.txt", content_type="text/plain", size=0, data=b"",
        raw_text=f"Forest Clearance for Ramagundam Opencast II. Valid until {expired_date_2.isoformat()}.",
        extracted_issue_date=expired_date_2 - timedelta(days=365 * 3), extracted_expiry_date=expired_date_2,
        extracted_permit_number="FC-2021-TG-0447", extraction_status="DONE",
    )
)
db.commit()
add_finding("MINE-1007", "CMR-STAT-002", "DOCUMENT", f"Forest Clearance ({doc2_id}) expired {expired_date_2.isoformat()}", source_id=doc2_id)
add_finding("MINE-1007", "CMR-SAFE-002", "INSPECTION", "Ventilation/gas monitoring checklist item failed.")
add_finding("MINE-1007", "CMR-SAFE-002", "INSPECTION", "A second, independent ventilation zone also failed inspection.")
sat7 = next(f for f in MOCK_SATELLITE_FINDINGS if f["mine_id"] == "MINE-1007")
add_finding("MINE-1007", sat7["rule_id"], "SATELLITE", sat7["description"], detail={"ndvi_loss_pct": sat7["ndvi_loss_pct"]})
db.commit()

# ---------------------------------------------------------------------------
# 3 YELLOW mines - moderate finding sets, each concentrated in a different domain
# ---------------------------------------------------------------------------

add_finding("MINE-1004", "CMR-SAFE-002", "INSPECTION", "Ventilation/gas monitoring checklist item failed.")
add_finding("MINE-1004", "CMR-SAFE-001", "INSPECTION", "Statutory safety inspection overdue by 15 days.")
db.commit()

add_finding("MINE-1005", "CMR-STAT-001", "DOCUMENT", "Environmental Clearance renewal filed late, provisional validity only.")
add_finding("MINE-1005", "CMR-STAT-003", "DOCUMENT", "Mining Plan approval renewal pending, provisional validity only.")
add_finding("MINE-1005", "CMR-STAT-004", "DOCUMENT", "Consent to Operate renewal filed 8 days late.")
db.commit()

add_finding("MINE-1006", "CMR-ENV-001", "SATELLITE", "Vegetation loss detected near lease boundary, under review.")
add_finding("MINE-1006", "CMR-ENV-001", "SATELLITE", "Second vegetation-loss patch detected in adjacent survey block.")
add_finding("MINE-1006", "CMR-OPS-001", "DOCUMENT", "Quarterly statutory return filed 6 days late.")
db.commit()

# ---------------------------------------------------------------------------
# Baseline "everything is fine" evidence on a GREEN mine (MINE-1001) so the
# document viewer / inspection detail views aren't empty-state-only
# ---------------------------------------------------------------------------

valid_doc_id = next_id(db, Document, Document.id, "DOC")
db.add(
    Document(
        id=valid_doc_id, mine_id="MINE-1001", uploaded_by_user_id=user_by_username["manager1"].id,
        doc_type="Environmental Clearance", filename="EC-jharia-central.txt", content_type="text/plain", size=0, data=b"",
        raw_text="Environmental Clearance for Jharia Central Colliery, valid and current.",
        extracted_issue_date=date.today() - timedelta(days=365), extracted_expiry_date=date.today() + timedelta(days=365 * 4),
        extracted_permit_number="J-11015/12/2024-IA.II(M)", extraction_status="DONE",
    )
)

baseline_inspection_id = next_id(db, Inspection, Inspection.id, "INSP")
db.add(
    Inspection(
        id=baseline_inspection_id, client_id=f"seed-{baseline_inspection_id}", mine_id="MINE-1001",
        inspector_user_id=user_by_username["inspector2"].id, case_id=None,
        checklist_answers=[
            {"item_id": "ventilation_gas_monitoring", "label": "Ventilation / gas monitoring", "passed": True, "notes": ""},
            {"item_id": "emergency_equipment", "label": "Fire-fighting / emergency equipment", "passed": True, "notes": ""},
        ],
        gps_lat=23.7397, gps_lng=86.4197, notes="Routine quarterly inspection, no issues found.",
        sync_status="ACKNOWLEDGED", submitted_at=datetime.now(timezone.utc) - timedelta(days=20),
    )
)
db.commit()

# ---------------------------------------------------------------------------
# Compute scores for every mine (auto-creates cases for RED mines)
# ---------------------------------------------------------------------------

for m in MINES:
    breakdown = compute_mine_score(db, m["id"])
    print(f"  {m['id']:9s} {m['name']:28s} {breakdown['overall']:5.1f}  {breakdown['band']}")

# ---------------------------------------------------------------------------
# Advance the two RED mines' auto-created cases to the states the plan calls for:
# hero mine (MINE-1003) -> TRIAGED, unassigned, ready for the live "Assign Case" demo step.
# second RED mine (MINE-1007) -> ASSIGNED, to prove the pattern generalizes without
# live-triggering it.
# ---------------------------------------------------------------------------

hero_case = db.query(Case).filter(Case.mine_id == "MINE-1003", Case.status != "CLOSED").first()
if hero_case:
    hero_case.status = "TRIAGED"

second_case = db.query(Case).filter(Case.mine_id == "MINE-1007", Case.status != "CLOSED").first()
if second_case:
    second_case.status = "ASSIGNED"
    second_case.assigned_to_user_id = user_by_username["inspector3"].id
db.commit()

# ---------------------------------------------------------------------------
# One historical CLOSED case on a GREEN mine (MINE-1002), to prove the full
# lifecycle is reachable outside the live walkthrough. Findings are RESOLVED so
# they don't affect the current (already-computed) score.
# ---------------------------------------------------------------------------

historical_case_id = next_id(db, Case, Case.id, "CASE")
db.add(
    Case(
        id=historical_case_id, mine_id="MINE-1002", status="CLOSED", severity="HIGH",
        title="Historical: overdue safety inspection (resolved)",
        ai_brief="A statutory safety inspection was overdue; the mine operator scheduled and completed the "
                  "inspection, and the finding was verified and closed by the DGMS officer.",
        assigned_to_user_id=user_by_username["inspector1"].id, created_by="SYSTEM",
        created_at=datetime.now(timezone.utc) - timedelta(days=60),
        closed_at=datetime.now(timezone.utc) - timedelta(days=40),
    )
)
db.flush()
db.add(
    ComplianceFinding(
        mine_id="MINE-1002", rule_id="CMR-SAFE-001", domain="SAFETY", source_type="INSPECTION",
        detail={}, severity="HIGH", status="RESOLVED",
        description="Statutory safety inspection was overdue (resolved).",
        score_impact=SEVERITY_POINTS["HIGH"], case_id=historical_case_id,
        detected_at=datetime.now(timezone.utc) - timedelta(days=60),
    )
)
db.commit()

print("\nSeed complete.")
print(f"Demo login (any user above), password: {DEMO_PASSWORD}")
print("Key accounts: admin / dgms_east (Chhattisgarh, covers hero mine) / manager3 (MINE-1003) / inspector1,2,3")
