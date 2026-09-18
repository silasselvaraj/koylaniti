import { notFound } from "next/navigation";
import { ApiError, getCase, getMe, getMineFindings } from "@/lib/api";
import { submitEvidenceAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusBadge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export default async function ManagerCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const t = await getT();
  const { caseId } = await params;
  const me = await getMe();

  let caseRow;
  try {
    caseRow = await getCase(caseId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (caseRow.mine_id !== me.mine_id) notFound();

  const findings = await getMineFindings(caseRow.mine_id);
  const linkedFindings = findings.filter((f) => f.case_id === caseId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{caseRow.title}</h1>
          <p className="text-sm text-muted-foreground">{caseRow.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={caseRow.severity} />
          <CaseStatusBadge status={caseRow.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Findings to remediate")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {linkedFindings.map((f) => (
            <div key={f.id} className="px-4 py-3 text-sm">
              {f.description}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Remediation")}</CardTitle>
        </CardHeader>
        <CardContent>
          {(caseRow.status === "ASSIGNED" || caseRow.status === "INSPECTION_REMEDIATION") && (
            <form action={submitEvidenceAction.bind(null, caseId)}>
              <p className="mb-3 text-sm text-muted-foreground">
                {t("Mark remediation evidence as submitted once corrective action has been taken. A DGMS officer will verify before the case is closed.")}
              </p>
              <Button type="submit">{t("Submit remediation evidence")}</Button>
            </form>
          )}
          {caseRow.status === "EVIDENCE_SUBMITTED" && (
            <p className="text-sm text-muted-foreground">{t("Evidence submitted — awaiting DGMS verification.")}</p>
          )}
          {caseRow.status === "VERIFIED" && <p className="text-sm text-muted-foreground">{t("Verified — awaiting closure.")}</p>}
          {caseRow.status === "CLOSED" && <p className="text-sm text-[var(--band-green)]">{t("Case closed.")}</p>}
          {(caseRow.status === "DETECTED" || caseRow.status === "TRIAGED") && (
            <p className="text-sm text-muted-foreground">{t("Waiting for DGMS to assign this case to an inspector.")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
