import { notFound } from "next/navigation";
import { ApiError, getCase, getCaseInspections, getMine, getMineFindings, getUsers } from "@/lib/api";
import { assignCaseAction, resolveCaseAction, verifyCaseAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusBadge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  let caseRow;
  try {
    caseRow = await getCase(caseId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const [mine, findings, inspections] = await Promise.all([
    getMine(caseRow.mine_id),
    getMineFindings(caseRow.mine_id),
    getCaseInspections(caseId),
  ]);
  const linkedFindings = findings.filter((f) => f.case_id === caseId);
  const inspectors = caseRow.status === "DETECTED" || caseRow.status === "TRIAGED" ? await getUsers({ role: "FIELD_INSPECTOR" }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{caseRow.title}</h1>
          <p className="text-sm text-muted-foreground">
            {mine.name} &middot; {caseRow.id} &middot; opened {new Date(caseRow.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={caseRow.severity} />
          <CaseStatusBadge status={caseRow.status} />
        </div>
      </div>

      {caseRow.ai_brief && (
        <Card>
          <CardHeader>
            <CardTitle>AI case brief</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{caseRow.ai_brief}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Linked findings ({linkedFindings.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {linkedFindings.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm">{f.description}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {f.rule_id ?? "—"} &middot; {f.source_type}
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
            <CardTitle>Inspection evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspections.map((insp) => (
              <div key={insp.id} className="rounded border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {insp.id} &middot; {insp.submitted_at ? new Date(insp.submitted_at).toLocaleString() : "—"}
                  </span>
                  <span>
                    {insp.gps_lat && insp.gps_lng ? `${insp.gps_lat.toFixed(4)}, ${insp.gps_lng.toFixed(4)}` : "No GPS"}
                  </span>
                </div>
                <ul className="space-y-1 text-sm">
                  {insp.checklist_answers.map((item) => (
                    <li key={item.item_id} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className={item.passed ? "text-[var(--band-green)]" : "text-[var(--severity-critical)]"}>
                        {item.passed ? "Pass" : "Fail"}
                      </span>
                    </li>
                  ))}
                </ul>
                {insp.notes && <p className="mt-2 text-sm text-muted-foreground">{insp.notes}</p>}
                {insp.has_photo && (
                  <img
                    src={`/api/proxy/inspections/${insp.id}/photo`}
                    alt="Inspection evidence"
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
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {(caseRow.status === "DETECTED" || caseRow.status === "TRIAGED") && (
            <form action={assignCaseAction.bind(null, caseId)} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="user_id">Assign to inspector</Label>
                <Select id="user_id" name="user_id" required defaultValue="">
                  <option value="" disabled>
                    Select an inspector
                  </option>
                  {inspectors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit">Assign case</Button>
            </form>
          )}

          {(caseRow.status === "ASSIGNED" || caseRow.status === "INSPECTION_REMEDIATION") && (
            <p className="text-sm text-muted-foreground">
              Waiting for the assigned inspector to submit checklist evidence.
            </p>
          )}

          {caseRow.status === "EVIDENCE_SUBMITTED" && (
            <form action={verifyCaseAction.bind(null, caseId)}>
              <Button type="submit">Verify evidence</Button>
            </form>
          )}

          {caseRow.status === "VERIFIED" && (
            <form action={resolveCaseAction.bind(null, caseId)} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reason">Closure reason</Label>
                <Textarea id="reason" name="reason" rows={2} placeholder="Evidence verified, remediation complete." />
              </div>
              <Button type="submit">Close case</Button>
            </form>
          )}

          {caseRow.status === "CLOSED" && (
            <p className="text-sm text-[var(--band-green)]">
              Closed {caseRow.closed_at ? new Date(caseRow.closed_at).toLocaleString() : ""}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
