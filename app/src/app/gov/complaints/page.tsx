import Link from "next/link";
import { getComplaints, getMines } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-surface-inset",
  UNDER_REVIEW: "bg-[var(--severity-medium)] text-white border-transparent",
  ESCALATED: "bg-[var(--band-yellow)] text-white border-transparent",
  DISMISSED: "bg-[var(--band-green)] text-white border-transparent",
};

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getT();
  const { status } = await searchParams;
  const [complaints, mines] = await Promise.all([getComplaints(status), getMines()]);
  const mineById = new Map(mines.map((m) => [m.id, m]));
  const statuses = ["NEW", "UNDER_REVIEW", "ESCALATED", "DISMISSED"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("Public Complaints")}</h1>
          <p className="text-sm text-muted-foreground">{t("Anonymously submitted concerns, awaiting triage.")}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <Link href="/gov/complaints" className={`rounded px-2 py-1 ${!status ? "bg-accent text-accent-foreground" : "bg-surface-inset"}`}>
            {t("All")}
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/gov/complaints?status=${s}`}
              className={`rounded px-2 py-1 ${status === s ? "bg-accent text-accent-foreground" : "bg-surface-inset"}`}
            >
              {t(s.replace(/_/g, " "))}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {complaints.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No complaints match this filter.")}</p>}
          {complaints.map((c) => {
            const mine = mineById.get(c.mine_id);
            return (
              <Link key={c.id} href={`/gov/complaints/${c.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset">
                <div>
                  <div className="text-sm font-medium">
                    {t(c.category)} &middot; {mine?.name ?? c.mine_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.id} &middot; {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge className={STATUS_STYLE[c.status] ?? ""}>{t(c.status.replace(/_/g, " "))}</Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
