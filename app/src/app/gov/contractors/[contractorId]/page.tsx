import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getContractor } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { formatRuleId } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export default async function ContractorDetailPage({ params }: { params: Promise<{ contractorId: string }> }) {
  const t = await getT();
  const { contractorId } = await params;

  let data;
  try {
    data = await getContractor(contractorId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const { contractor, findings, open_case_ids } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{contractor.name}</h1>
        <p className="text-sm text-muted-foreground">
          {contractor.specialization ?? "—"} {contractor.license_number && `· ${contractor.license_number}`}
        </p>
        {contractor.contact_person && (
          <p className="text-xs text-muted-foreground">
            {contractor.contact_person} {contractor.phone && `· ${contractor.phone}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">{t("Related findings")}</div>
            <div className="mt-1 text-2xl font-semibold font-mono">{findings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">{t("Open actions")}</div>
            <div className="mt-1 text-2xl font-semibold font-mono">{open_case_ids.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Related findings")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {findings.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No findings linked yet.")}</p>}
          {findings.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm">{f.description}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatRuleId(f.rule_id)}
                  {f.case_id && (
                    <>
                      {" "}
                      &middot; <Link href={`/gov/cases/${f.case_id}`} className="text-accent underline">
                        {f.case_id}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <SeverityBadge severity={f.severity} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
