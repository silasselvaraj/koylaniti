"""Canned satellite findings - not a real imagery pipeline (see plan: mocked/demo data only).
Images live in app/public/satellite/ in the frontend, served as static files."""

MOCK_SATELLITE_FINDINGS = [
    {
        "mine_id": "MINE-1003",
        "rule_id": "CMR-ENV-001",
        "before_image": "/satellite/mine-1003-before.jpg",
        "after_image": "/satellite/mine-1003-after.jpg",
        "before_date": "2024-01-15",
        "after_date": "2025-06-20",
        "ndvi_loss_pct": 18.4,
        "anomaly_polygon": [
            [23.7957, 86.4304],
            [23.7961, 86.4321],
            [23.7948, 86.4327],
            [23.7944, 86.4309],
        ],
        "severity": "CRITICAL",
        "description": "18.4% vegetation loss detected outside the approved lease boundary between Jan 2024 and Jun 2025.",
    },
    {
        "mine_id": "MINE-1007",
        "rule_id": "CMR-ENV-001",
        "before_image": "/satellite/mine-1007-before.jpg",
        "after_image": "/satellite/mine-1007-after.jpg",
        "before_date": "2024-03-01",
        "after_date": "2025-05-10",
        "ndvi_loss_pct": 6.2,
        "anomaly_polygon": [
            [21.2145, 81.6288],
            [21.2151, 81.6301],
            [21.2140, 81.6309],
        ],
        "severity": "MEDIUM",
        "description": "6.2% vegetation loss detected, within tolerance but flagged for monitoring.",
    },
]


def get_finding_for_mine(mine_id: str) -> dict | None:
    for finding in MOCK_SATELLITE_FINDINGS:
        if finding["mine_id"] == mine_id:
            return finding
    return None
