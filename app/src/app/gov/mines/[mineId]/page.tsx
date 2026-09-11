import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getMine, getMineCompliance, getMineDocuments, getMineFindings, getMineMonitoring } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BandBadge, SeverityBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/score-bar";
import { RiskPanel } from "@/components/risk-panel";
import { formatRuleId } from "@/lib/format";

const DOMAIN_LABEL: Record<string, string> = {
  STATUTORY: "Statutory Documents",
  SAFETY: "Safety / Field Inspection",
  ENVIRONMENTAL: "Environmental / Satellite",
  OPERATIONAL: "Operational / Other",
};

export default async function MineDetailPage({ params }: { params: Promise<{ mineId: string }> }) {
  const { mineId } = await params;

  let mine, compliance, findings, documents, satellite;
  try {
    [mine, compliance, findings, documents, satellite] = await Promise.all([
      getMine(mineId),
      getMineCompliance(mineId),
      getMineFindings(mineId),
      getMineDocuments(mineId),
      getMineMonitoring(mineId),
    ]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const openFindings = findings.filter((f) => f.status === "OPEN");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{mine.name}</h1>
          <p className="text-sm text-muted-foreground">
            {mine.district}, {mine.state} &middot; {mine.mine_type} &middot; {mine.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-2xl font-semibold">{compliance.overall.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">compliance score</div>
          </div>
          <BandBadge band={compliance.band} />
        </div>
      </div>

      {compliance.case_id && (
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm">
              This mine has an open case: <span className="font-mono">{compliance.case_id}</span>
            </span>
            <Link
              href={`/gov/cases/${compliance.case_id}`}
              className="inline-flex h-10 items-center justify-center rounded bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-strong"
            >
              Open case
            </Link>
          </CardContent>
        </Card>
      )}

      <RiskPanel findings={findings} />

      <Card>
        <CardHeader>
          <CardTitle>Score breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(compliance.domains).map(([domain, d]) => (
            <ScoreBar key={domain} label={DOMAIN_LABEL[domain] ?? domain} score={d.score} weight={d.weight} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open findings ({openFindings.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {openFindings.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No open findings.</p>}
          {openFindings.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm">{f.description}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatRuleId(f.rule_id)} &middot; {DOMAIN_LABEL[f.domain] ?? f.domain} &middot; {f.source_type}
                </div>
              </div>
              <SeverityBadge severity={f.severity} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {documents.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No documents uploaded.</p>}
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{d.doc_type}</div>
                <div className="text-xs text-muted-foreground">
                  {d.extracted_permit_number ?? "No permit number extracted"}
                  {d.extracted_expiry_date && ` · expires ${d.extracted_expiry_date}`}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{d.extraction_status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {satellite && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm">{satellite.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <figure>
                <img src={satellite.before_image} alt="Before" className="w-full rounded border border-border" />
                <figcaption className="mt-1 text-xs text-muted-foreground">Before &mdash; {satellite.before_date}</figcaption>
              </figure>
              <figure>
                <img src={satellite.after_image} alt="After" className="w-full rounded border border-border" />
                <figcaption className="mt-1 text-xs text-muted-foreground">After &mdash; {satellite.after_date}</figcaption>
              </figure>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">NDVI vegetation loss: {satellite.ndvi_loss_pct}%</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
