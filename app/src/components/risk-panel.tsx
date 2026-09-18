import type { Finding } from "@/lib/api";
import { deriveRiskFactors } from "@/lib/risk-factors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

export async function RiskPanel({ findings }: { findings: Finding[] }) {
  const t = await getT();
  const factors = deriveRiskFactors(findings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Why is this high risk?")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {factors.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No open findings contributing to risk right now.")}</p>
        ) : (
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  {f.kind === "summary"
                    ? t("{count} CRITICAL finding(s) currently open", { count: f.count ?? 0 })
                    : f.description}
                </span>
                <SeverityBadge severity={f.severity} />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
          <p>{t("Prototype risk assumptions — demonstration only.")}</p>
          <p>{t("AI/ML assists prioritisation; it does not decide legal compliance.")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
