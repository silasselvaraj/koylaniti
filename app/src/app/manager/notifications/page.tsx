import { getNotifications } from "@/lib/api";
import { NotificationsPanel } from "@/components/notifications-panel";

export default async function ManagerNotificationsPage() {
  const notifications = await getNotifications();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Alerts</h1>
      <NotificationsPanel notifications={notifications} path="/manager/notifications" role="manager" />
    </div>
  );
}
