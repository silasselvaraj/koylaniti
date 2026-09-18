import type { Finding } from "./api";

export interface RiskFactor {
  kind: "summary" | "finding";
  severity: string;
  /** For `summary` factors: the CRITICAL finding count. */
  count?: number;
  /** For `finding` factors: the finding's own description (seeded data, English). */
  description?: string;
}

/** Pure function: turns a mine/case's open findings into risk factors.
 * The CRITICAL summary is returned as a structured factor so the UI can
 * translate it; individual findings reuse their own description verbatim. */
export function deriveRiskFactors(findings: Finding[]): RiskFactor[] {
  const open = findings.filter((f) => f.status === "OPEN");
  const factors: RiskFactor[] = [];

  const criticalCount = open.filter((f) => f.severity === "CRITICAL").length;
  if (criticalCount > 0) {
    factors.push({ kind: "summary", severity: "CRITICAL", count: criticalCount });
  }

  for (const f of open) {
    factors.push({ kind: "finding", severity: f.severity, description: f.description });
  }

  return factors;
}
