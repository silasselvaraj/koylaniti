import type { Finding } from "@/lib/api";
import { deriveRiskFactors } from "@/lib/risk-factors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";

export function RiskPanel({ findings }: { findings: Finding[] }) {
  const factors = deriveRiskFactors(findings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Why is this high risk?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {factors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open findings contributing to risk right now.</p>
        ) : (
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <span>{f.label}</span>
                <SeverityBadge severity={f.severity} />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
          <p>Prototype risk assumptions &mdash; demonstration only.</p>
          <p>AI/ML assists prioritisation; it does not decide legal compliance.</p>
        </div>
      </CardContent>
    </Card>
  );
}
