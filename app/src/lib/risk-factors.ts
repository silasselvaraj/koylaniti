import type { Finding } from "./api";

export interface RiskFactor {
  label: string;
  severity: string;
}

/** Pure function: turns a mine/case's open findings into plain-language risk factors.
 * Reuses each finding's own description rather than reparsing detail JSON - the seed
 * data's descriptions already read as factors verbatim. */
export function deriveRiskFactors(findings: Finding[]): RiskFactor[] {
  const open = findings.filter((f) => f.status === "OPEN");
  const factors: RiskFactor[] = [];

  const criticalCount = open.filter((f) => f.severity === "CRITICAL").length;
  if (criticalCount > 0) {
    factors.push({
      label: `${criticalCount} CRITICAL finding${criticalCount > 1 ? "s" : ""} currently open`,
      severity: "CRITICAL",
    });
  }

  for (const f of open) {
    factors.push({ label: f.description, severity: f.severity });
  }

  return factors;
}
