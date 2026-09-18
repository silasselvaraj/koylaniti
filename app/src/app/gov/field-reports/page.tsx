import { getMines, getStandaloneInspections, getUsers } from "@/lib/api";
import { reviewFieldReportAction } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export default async function FieldReportsPage() {
  const t = await getT();
  const [inspections, mines, users] = await Promise.all([getStandaloneInspections(), getMines(), getUsers()]);
  const mineById = new Map(mines.map((m) => [m.id, m]));
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("Field reports")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Reports filed by inspectors that aren’t tied to an existing case assignment.")}
        </p>
      </div>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {inspections.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No standalone field reports yet.")}</p>}
          {inspections.map((insp) => {
            const mine = mineById.get(insp.mine_id);
            const inspector = userById.get(insp.inspector_user_id);
            return (
              <div key={insp.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">
                    {insp.report_type} &middot; {mine?.name ?? insp.mine_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {inspector?.full_name ?? `${t("user #")}${insp.inspector_user_id}`} &middot;{" "}
                    {insp.submitted_at ? new Date(insp.submitted_at).toLocaleString() : "—"}
                  </div>
                  {insp.notes && <p className="mt-1 text-sm">{insp.notes}</p>}
                </div>
                <form action={reviewFieldReportAction.bind(null, insp.id)}>
                  <Button type="submit" variant="secondary" size="sm">
                    {t("Mark reviewed")}
                  </Button>
                </form>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
