import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiError, getCase, getCaseAudit, getCaseInspections, getComplaintsForCase, getMine, getMineFindings, getRules, getUsers } from "@/lib/api";
import { assignCaseAction, resolveCaseAction, verifyCaseAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusBadge, OverdueBadge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { RiskPanel } from "@/components/risk-panel";
import { EvidenceGraph } from "@/components/evidence-graph";
import { formatRuleId } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const t = await getT();
  const { caseId } = await params;

  let caseRow;
  try {
    caseRow = await getCase(caseId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const [mine, findings, inspections, rules, auditRows, allUsers, originatingComplaints] = await Promise.all([
    getMine(caseRow.mine_id),
    getMineFindings(caseRow.mine_id),
    getCaseInspections(caseId),
    getRules(),
    getCaseAudit(caseId),
    getUsers(),
    getComplaintsForCase(caseId),
  ]);
  const linkedFindings = findings.filter((f) => f.case_id === caseId);
  const inspectors = allUsers.filter((u) => u.role === "FIELD_INSPECTOR");
  const ruleById = Object.fromEntries(rules.map((r) => [r.id, r]));
  const userNameById = Object.fromEntries(allUsers.map((u) => [u.id, u.full_name]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{caseRow.title}</h1>
          <p className="text-sm text-muted-foreground">
            {mine.name} &middot; {caseRow.id} &middot; {t("opened")} {new Date(caseRow.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OverdueBadge isOverdue={caseRow.is_overdue} />
          <SeverityBadge severity={caseRow.severity} />
          <CaseStatusBadge status={caseRow.status} />
        </div>
      </div>

      {originatingComplaints.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm">
              {t("Originated from public complaint")}{" "}
              <span className="font-mono">{originatingComplaints[0].id}</span>
            </span>
            <Link
              href={`/gov/complaints/${originatingComplaints[0].id}`}
              className="inline-flex h-9 items-center justify-center rounded bg-surface-inset px-3 text-sm font-medium hover:bg-border"
            >
              {t("View complaint")}
            </Link>
          </CardContent>
        </Card>
      )}

      {caseRow.ai_brief && (
        <Card>
          <CardHeader>
            <CardTitle>{t("AI case brief")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{caseRow.ai_brief}</CardContent>
        </Card>
      )}

      <RiskPanel findings={linkedFindings} />

      <EvidenceGraph
        caseRow={caseRow}
        linkedFindings={linkedFindings}
        ruleById={ruleById}
        inspections={inspections}
        auditRows={auditRows}
        userNameById={userNameById}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("Linked findings ({count})", { count: linkedFindings.length })}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {linkedFindings.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm">{f.description}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatRuleId(f.rule_id)} &middot; {f.source_type}
                </div>
              </div>
              <SeverityBadge severity={f.severity} />
            </div>
          ))}
        </CardContent>
      </Card>

      {inspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("Inspection evidence")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspections.map((insp) => (
              <div key={insp.id} className="rounded border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {insp.id} &middot; {insp.submitted_at ? new Date(insp.submitted_at).toLocaleString() : "—"}
                  </span>
                  <span>
                    {insp.gps_lat && insp.gps_lng ? `${insp.gps_lat.toFixed(4)}, ${insp.gps_lng.toFixed(4)}` : t("No GPS")}
                  </span>
                </div>
                <ul className="space-y-1 text-sm">
                  {insp.checklist_answers.map((item) => (
                    <li key={item.item_id} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className={item.passed ? "text-[var(--band-green)]" : "text-[var(--severity-critical)]"}>
                        {item.passed ? t("Pass") : t("Fail")}
                      </span>
                    </li>
                  ))}
                </ul>
                {insp.notes && <p className="mt-2 text-sm text-muted-foreground">{insp.notes}</p>}
                {insp.has_photo && (
                  <img
                    src={`/api/proxy/inspections/${insp.id}/photo`}
                    alt={t("Inspection evidence")}
                    className="mt-2 max-h-64 rounded border border-border"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("Actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {(caseRow.status === "DETECTED" || caseRow.status === "TRIAGED") && (
            <form action={assignCaseAction.bind(null, caseId)} className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="user_id">{t("Assign to inspector")}</Label>
                  <Select id="user_id" name="user_id" required defaultValue="">
                    <option value="" disabled>
                      {t("Select an inspector")}
                    </option>
                    {inspectors.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="due_date">{t("Due date (SLA)")}</Label>
                  <Input id="due_date" name="due_date" type="date" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="escalation_target">{t("Escalation target")}</Label>
                  <Input id="escalation_target" name="escalation_target" placeholder={t("e.g. State DGMS Office")} />
                </div>
              </div>
              <Button type="submit">{t("Assign case")}</Button>
            </form>
          )}

          {(caseRow.status === "ASSIGNED" || caseRow.status === "INSPECTION_REMEDIATION") && (
            <p className="text-sm text-muted-foreground">
              {t("Waiting for the assigned inspector to submit checklist evidence.")}
              {caseRow.due_date && `${t(" Due ")}${new Date(caseRow.due_date).toLocaleDateString()}.`}
              {caseRow.escalation_target && `${t(" Escalation: ")}${caseRow.escalation_target}.`}
            </p>
          )}

          {caseRow.status === "EVIDENCE_SUBMITTED" && (
            <form action={verifyCaseAction.bind(null, caseId)}>
              <Button type="submit">{t("Verify evidence")}</Button>
            </form>
          )}

          {caseRow.status === "VERIFIED" && (
            <form action={resolveCaseAction.bind(null, caseId)} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reason">{t("Closure reason")}</Label>
                <Textarea id="reason" name="reason" rows={2} placeholder={t("Evidence verified, remediation complete.")} />
              </div>
              <Button type="submit">{t("Close case")}</Button>
            </form>
          )}

          {caseRow.status === "CLOSED" && (
            <p className="text-sm text-[var(--band-green)]">
              {t("Closed ")}
              {caseRow.closed_at ? new Date(caseRow.closed_at).toLocaleString() : ""}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
