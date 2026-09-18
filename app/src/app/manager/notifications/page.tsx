import { getNotifications } from "@/lib/api";
import { NotificationsPanel } from "@/components/notifications-panel";
import { getT } from "@/lib/i18n/server";

export default async function ManagerNotificationsPage() {
  const t = await getT();
  const notifications = await getNotifications();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t("Alerts")}</h1>
      <NotificationsPanel notifications={notifications} path="/manager/notifications" role="manager" />
    </div>
  );
}
