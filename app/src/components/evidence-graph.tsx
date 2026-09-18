import Link from "next/link";
import type { AuditLogRow, Case, Finding, Inspection, Rule } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRuleId } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

const NODES = [
  { id: "eg-rule", label: "Control" },
  { id: "eg-evidence", label: "Evidence" },
  { id: "eg-observation", label: "Observation" },
  { id: "eg-risk", label: "Risk" },
  { id: "eg-action", label: "Action" },
  { id: "eg-closure", label: "Closure" },
  { id: "eg-verification", label: "Verification" },
  { id: "eg-audit", label: "Audit" },
];

function findAuditByTransition(auditRows: AuditLogRow[], from: string, to: string) {
  return auditRows.find((a) => a.event_type === "case_transition" && a.detail?.startsWith(`${from}->${to}`));
}

export async function EvidenceGraph({
  caseRow,
  linkedFindings,
  ruleById,
  inspections,
  auditRows,
  userNameById,
}: {
  caseRow: Case;
  linkedFindings: Finding[];
  ruleById: Record<string, Rule>;
  inspections: Inspection[];
  auditRows: AuditLogRow[];
  userNameById: Record<number, string>;
}) {
  const t = await getT();
  const rules = [...new Set(linkedFindings.map((f) => f.rule_id).filter((r): r is string => !!r))].map(
    (id) => ruleById[id]
  );
  const documentFindings = linkedFindings.filter((f) => f.source_type === "DOCUMENT");
  const totalImpact = linkedFindings.reduce((s, f) => s + f.score_impact, 0);
  const closureAudit = findAuditByTransition(auditRows, "VERIFIED", "CLOSED");
  const verificationAudit = findAuditByTransition(auditRows, "EVIDENCE_SUBMITTED", "VERIFIED");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Compliance Evidence Graph")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <nav className="flex flex-wrap gap-2 text-xs">
          {NODES.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} className="rounded bg-surface-inset px-2 py-1 hover:bg-border">
              {i + 1}. {t(n.label)}
            </a>
          ))}
        </nav>

        <GraphNode id="eg-rule" title={t("1. Regulation / KoylaNiti Control")}>
          {rules.length === 0 && <Empty text={t("No linked control.")} />}
          {rules.map((r) => (
            <div key={r.id} className="text-sm">
              <div className="font-medium">{formatRuleId(r.id)}</div>
              <div className="text-xs text-muted-foreground">{r.source} &mdash; {r.description}</div>
            </div>
          ))}
        </GraphNode>

        <GraphNode id="eg-evidence" title={t("2. Evidence / Document")}>
          {documentFindings.length === 0 && <Empty text={t("No document-sourced evidence linked to this case.")} />}
          {documentFindings.map((f) => (
            <div key={f.id} className="text-sm">{f.description}</div>
          ))}
        </GraphNode>

        <GraphNode id="eg-observation" title={t("3. Field Observation")}>
          {inspections.length === 0 && <Empty text={t("No field inspection submitted yet.")} />}
          {inspections.map((insp) => (
            <div key={insp.id} className="text-sm">
              {insp.id} &mdash; {insp.submitted_at ? new Date(insp.submitted_at).toLocaleString() : t("pending sync")}
              {insp.gps_lat && insp.gps_lng ? ` · GPS ${insp.gps_lat.toFixed(4)}, ${insp.gps_lng.toFixed(4)}` : ""}
            </div>
          ))}
        </GraphNode>

        <GraphNode id="eg-risk" title={t("4. Risk Score Contribution")}>
          <div className="text-sm">
            {t("{count} finding(s) linked, contributing {points} point(s) of deduction", {
              count: linkedFindings.length,
              points: totalImpact,
            })}{" "}
            &middot; {t("case severity")} <b>{t(caseRow.severity)}</b>
          </div>
        </GraphNode>

        <GraphNode id="eg-action" title={t("5. Corrective Action")}>
          <div className="text-sm">
            {caseRow.title} ({caseRow.id}) &mdash; {t("status")} <b>{t(caseRow.status.replace(/_/g, " "))}</b>
            {caseRow.assigned_to_user_id != null &&
              ` · ${t("assigned to")} ${userNameById[caseRow.assigned_to_user_id] ?? `${t("user #")}${caseRow.assigned_to_user_id}`}`}
          </div>
        </GraphNode>

        <GraphNode id="eg-closure" title={t("6. Closure Evidence")}>
          {closureAudit ? (
            <div className="text-sm">{closureAudit.detail?.split(": ").slice(1).join(": ") || t("Closed.")}</div>
          ) : (
            <Empty text={t("Not closed yet.")} />
          )}
        </GraphNode>

        <GraphNode id="eg-verification" title={t("7. Authorized Verification")}>
          {verificationAudit ? (
            <div className="text-sm">
              {t("Verified by")}{" "}
              {verificationAudit.user_id != null
                ? userNameById[verificationAudit.user_id] ?? `${t("user #")}${verificationAudit.user_id}`
                : "—"}{" "}
              {t("on")} {new Date(verificationAudit.created_at).toLocaleString()}
            </div>
          ) : (
            <Empty text={t("Not verified yet.")} />
          )}
        </GraphNode>

        <GraphNode id="eg-audit" title={t("8. Audit Timeline")}>
          {auditRows.length === 0 && <Empty text={t("No audit events yet.")} />}
          <ul className="space-y-1 text-sm">
            {auditRows.map((a) => (
              <li key={a.id} className="text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleString()} &mdash; {a.event_type}
                {a.detail ? `: ${a.detail}` : ""}
                <span className="ml-2 font-mono text-[10px] opacity-70">#{a.hash.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
          {auditRows.length > 0 && (
            <Link href="/gov/audit" className="mt-2 inline-block text-xs text-accent underline">
              {t("Verify audit chain integrity")}
            </Link>
          )}
        </GraphNode>
      </CardContent>
    </Card>
  );
}

function GraphNode({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 border-l-2 border-accent pl-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
