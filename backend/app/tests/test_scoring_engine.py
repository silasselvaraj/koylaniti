from app.scoring.config import band_for_score
from app.scoring.engine import compute_score_breakdown, score_domain


def test_score_domain_no_findings_is_perfect():
    assert score_domain([]) == 100.0


def test_score_domain_subtracts_impact():
    assert score_domain([{"score_impact": 25}, {"score_impact": 15}]) == 60.0


def test_score_domain_clamps_at_zero():
    assert score_domain([{"score_impact": 60}, {"score_impact": 60}]) == 0.0


def test_band_thresholds():
    assert band_for_score(100) == "GREEN"
    assert band_for_score(80) == "GREEN"
    assert band_for_score(79.9) == "YELLOW"
    assert band_for_score(60) == "YELLOW"
    assert band_for_score(59.9) == "RED"
    assert band_for_score(0) == "RED"


def test_compute_score_breakdown_all_clean_is_green():
    breakdown = compute_score_breakdown({})
    assert breakdown["overall"] == 100.0
    assert breakdown["band"] == "GREEN"
    assert set(breakdown["domains"].keys()) == {"STATUTORY", "SAFETY", "ENVIRONMENTAL", "OPERATIONAL"}


def test_compute_score_breakdown_weights_domains_correctly():
    # STATUTORY weight .30: one CRITICAL (40pt) finding -> domain score 60 -> contributes 18.0
    # Everything else clean (100 * their weight)
    breakdown = compute_score_breakdown(
        {"STATUTORY": [{"score_impact": 40, "severity": "CRITICAL"}]}
    )
    assert breakdown["domains"]["STATUTORY"]["score"] == 60.0
    expected_overall = 60.0 * 0.30 + 100.0 * 0.35 + 100.0 * 0.25 + 100.0 * 0.10
    assert breakdown["overall"] == round(expected_overall, 1)
    assert breakdown["band"] == "GREEN"


def test_compute_score_breakdown_hero_mine_scenario_is_red():
    # Mirrors the seeded demo hero mine: 1 expired doc (STATUTORY CRITICAL),
    # 2 safety findings (HIGH + CRITICAL), 1 satellite anomaly (ENVIRONMENTAL CRITICAL)
    breakdown = compute_score_breakdown(
        {
            "STATUTORY": [{"score_impact": 40, "severity": "CRITICAL"}],
            "SAFETY": [
                {"score_impact": 25, "severity": "HIGH"},
                {"score_impact": 40, "severity": "CRITICAL"},
            ],
            "ENVIRONMENTAL": [{"score_impact": 40, "severity": "CRITICAL"}],
        }
    )
    assert breakdown["domains"]["STATUTORY"]["score"] == 60.0
    assert breakdown["domains"]["SAFETY"]["score"] == 35.0
    assert breakdown["domains"]["ENVIRONMENTAL"]["score"] == 60.0
    assert breakdown["domains"]["OPERATIONAL"]["score"] == 100.0
    assert breakdown["band"] == "RED"
