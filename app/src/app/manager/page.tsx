import Link from "next/link";
import { getCases, getMe, getMine, getMineCompliance, getMineDocuments, getMineFindings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BandBadge, CaseStatusBadge, SeverityBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/score-bar";
import { getT } from "@/lib/i18n/server";

const DOMAIN_LABEL: Record<string, string> = {
  STATUTORY: "Statutory Documents",
  SAFETY: "Safety / Field Inspection",
  ENVIRONMENTAL: "Environmental / Satellite",
  OPERATIONAL: "Operational / Other",
};

export default async function ManagerHome() {
  const t = await getT();
  const me = await getMe();
  if (!me.mine_id) {
    return <p className="text-sm text-muted-foreground">{t("No mine is assigned to this account.")}</p>;
  }
  const [mine, compliance, documents, findings, cases] = await Promise.all([
    getMine(me.mine_id),
    getMineCompliance(me.mine_id),
    getMineDocuments(me.mine_id),
    getMineFindings(me.mine_id),
    getCases({ mine_id: me.mine_id }),
  ]);
  const expiringDocs = documents.filter((d) => d.extracted_expiry_date);
  const openCases = cases.filter((c) => c.status !== "CLOSED");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{mine.name}</h1>
          <p className="text-sm text-muted-foreground">
            {mine.district}, {mine.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-2xl font-semibold">{compliance.overall.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">{t("compliance score")}</div>
          </div>
          <BandBadge band={compliance.band} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Score breakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(compliance.domains).map(([domain, d]) => (
            <ScoreBar key={domain} label={DOMAIN_LABEL[domain] ?? domain} score={d.score} weight={d.weight} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("Open cases")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {openCases.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No open cases.")}</p>}
          {openCases.map((c) => (
            <Link key={c.id} href={`/manager/cases/${c.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset">
              <div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={c.severity} />
                <CaseStatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("Documents")}</CardTitle>
          <Link href="/manager/documents" className="text-xs text-accent underline">
            {t("Upload document")}
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {expiringDocs.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No documents on file.")}</p>}
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{d.doc_type}</div>
                <div className="text-xs text-muted-foreground">
                  {d.extracted_expiry_date ? `${t("Expires ")}${d.extracted_expiry_date}` : t("No expiry extracted")}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{d.extraction_status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Open findings ({count})", { count: findings.filter((f) => f.status === "OPEN").length })}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {findings
            .filter((f) => f.status === "OPEN")
            .map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="text-sm">{f.description}</div>
                <SeverityBadge severity={f.severity} />
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
