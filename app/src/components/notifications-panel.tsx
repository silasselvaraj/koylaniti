import type { NotificationRow } from "@/lib/api";
import { markNotificationReadAction } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import Link from "next/link";

function caseHref(role: "gov" | "manager" | "inspector", caseId: string): string {
  if (role === "manager") return `/manager/cases/${caseId}`;
  if (role === "inspector") return `/inspector/inspect/${caseId}`;
  return `/gov/cases/${caseId}`;
}

export async function NotificationsPanel({
  notifications,
  path,
  role,
}: {
  notifications: NotificationRow[];
  path: string;
  role: "gov" | "manager" | "inspector";
}) {
  const t = await getT();
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {notifications.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">{t("No alerts.")}</p>}
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <div className={`text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`}>{n.message}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
                {n.case_id && (
                  <>
                    {" "}
                    &middot; <Link href={caseHref(role, n.case_id)} className="text-accent underline">
                      {n.case_id}
                    </Link>
                  </>
                )}
              </div>
            </div>
            {!n.read && (
              <form action={markNotificationReadAction.bind(null, n.id, path)}>
                <Button type="submit" variant="secondary" size="sm">
                  {t("Mark read")}
                </Button>
              </form>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
