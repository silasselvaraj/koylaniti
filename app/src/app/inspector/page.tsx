import Link from "next/link";
import { getCases, getMines } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { CaseStatusBadge, SeverityBadge } from "@/components/ui/badge";

export default async function InspectorHome() {
  const [cases, mines] = await Promise.all([getCases(), getMines()]);
  const mineById = new Map(mines.map((m) => [m.id, m]));
  const active = cases.filter((c) => c.status === "ASSIGNED" || c.status === "INSPECTION_REMEDIATION");
  const done = cases.filter((c) => c.status !== "ASSIGNED" && c.status !== "INSPECTION_REMEDIATION");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My assignments</h1>
        <Link
          href="/inspector/report/new"
          className="inline-flex h-9 items-center justify-center rounded bg-accent px-3 text-sm font-medium text-accent-foreground hover:bg-accent-strong"
        >
          File a report
        </Link>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {active.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No assignments waiting on you.</p>}
          {active.map((c) => {
            const mine = mineById.get(c.mine_id);
            return (
              <Link
                key={c.id}
                href={`/inspector/inspect/${c.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset"
              >
                <div>
                  <div className="text-sm font-medium">{mine?.name ?? c.mine_id}</div>
                  <div className="text-xs text-muted-foreground">{c.title}</div>
                </div>
                <SeverityBadge severity={c.severity} />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Past assignments</h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {done.map((c) => {
                const mine = mineById.get(c.mine_id);
                return (
                  <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <div className="text-sm">{mine?.name ?? c.mine_id}</div>
                      <div className="text-xs text-muted-foreground">{c.title}</div>
                    </div>
                    <CaseStatusBadge status={c.status} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
