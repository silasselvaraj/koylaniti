import Link from "next/link";
import { getCases, getMines } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { CaseStatusBadge, SeverityBadge } from "@/components/ui/badge";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; severity?: string }>;
}) {
  const { status, severity } = await searchParams;
  const [cases, mines] = await Promise.all([getCases({ status, severity }), getMines()]);
  const mineById = new Map(mines.map((m) => [m.id, m]));

  const statuses = ["DETECTED", "TRIAGED", "ASSIGNED", "INSPECTION_REMEDIATION", "EVIDENCE_SUBMITTED", "VERIFIED", "CLOSED"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Cases</h1>
        <div className="flex gap-2 text-xs">
          <Link href="/gov/cases" className={`rounded px-2 py-1 ${!status ? "bg-accent text-accent-foreground" : "bg-surface-inset"}`}>
            All
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/gov/cases?status=${s}`}
              className={`rounded px-2 py-1 ${status === s ? "bg-accent text-accent-foreground" : "bg-surface-inset"}`}
            >
              {s.replace(/_/g, " ")}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {cases.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No cases match this filter.</p>}
          {cases.map((c) => {
            const mine = mineById.get(c.mine_id);
            return (
              <Link key={c.id} href={`/gov/cases/${c.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset">
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {mine?.name ?? c.mine_id} &middot; {c.id} &middot; opened {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={c.severity} />
                  <CaseStatusBadge status={c.status} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
