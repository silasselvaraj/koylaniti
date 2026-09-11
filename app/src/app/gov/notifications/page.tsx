import { getNotifications } from "@/lib/api";
import { NotificationsPanel } from "@/components/notifications-panel";

export default async function GovNotificationsPage() {
  const notifications = await getNotifications();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Alerts</h1>
      <NotificationsPanel notifications={notifications} path="/gov/notifications" role="gov" />
    </div>
  );
}
