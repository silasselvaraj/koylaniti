DOMAIN_WEIGHTS = {
    "STATUTORY": 0.30,
    "SAFETY": 0.35,
    "ENVIRONMENTAL": 0.25,
    "OPERATIONAL": 0.10,
}

# Ordered highest threshold first - first match wins.
BAND_THRESHOLDS = [
    (80, "GREEN"),
    (60, "YELLOW"),
    (0, "RED"),
]

SEVERITY_POINTS = {
    "CRITICAL": 40,
    "HIGH": 25,
    "MEDIUM": 15,
    "LOW": 5,
}


def band_for_score(score: float) -> str:
    for threshold, band in BAND_THRESHOLDS:
        if score >= threshold:
            return band
    return BAND_THRESHOLDS[-1][1]
