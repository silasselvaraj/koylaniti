import Link from "next/link";
import { getMines, getComplianceReport, getCases } from "@/lib/api";
import { MineMapLoader } from "@/components/mine-map-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BandBadge, CaseStatusBadge, OverdueBadge, SeverityBadge } from "@/components/ui/badge";

export default async function GovDashboard() {
  const [mines, report, openCases] = await Promise.all([
    getMines(),
    getComplianceReport(),
    getCases({ status: "DETECTED" }),
  ]);
  const triaged = await getCases({ status: "TRIAGED" });
  const assigned = await getCases({ status: "ASSIGNED" });
  const actionableCases = [...openCases, ...triaged, ...assigned].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total mines" value={report.total_mines} />
        <StatTile label="Red mines" value={report.band_counts.RED ?? 0} accent="var(--band-red)" />
        <StatTile label="Yellow mines" value={report.band_counts.YELLOW ?? 0} accent="var(--band-yellow)" />
        <StatTile label="Avg. score" value={report.avg_score?.toFixed(0) ?? "—"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mine locations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MineMapLoader mines={mines} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Cases needing action</CardTitle>
          <Link href="/gov/cases" className="text-xs text-accent underline">
            View all cases
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {actionableCases.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">No cases need action right now.</p>
          )}
          {actionableCases.map((c) => {
            const mine = mines.find((m) => m.id === c.mine_id);
            return (
              <Link
                key={c.id}
                href={`/gov/cases/${c.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset"
              >
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {mine?.name ?? c.mine_id} &middot; {c.id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OverdueBadge isOverdue={c.is_overdue} />
                  <SeverityBadge severity={c.severity} />
                  <CaseStatusBadge status={c.status} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All mines</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {mines.map((m) => (
            <Link key={m.id} href={`/gov/mines/${m.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset">
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.district}, {m.state}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{m.current_score?.toFixed(0) ?? "—"}</span>
                <BandBadge band={m.current_band} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold font-mono" style={accent ? { color: accent } : undefined}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
