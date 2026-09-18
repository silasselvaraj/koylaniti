import Link from "next/link";
import { getFullName, getRole } from "@/lib/session";
import { logoutAction } from "@/lib/actions";
import { getNotifications } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LocaleToggle } from "@/components/locale-toggle";
import { getT } from "@/lib/i18n/server";

const NAV: Record<string, { href: string; label: string }[]> = {
  MINISTRY_ADMIN: [
    { href: "/gov", label: "Map" },
    { href: "/gov/cases", label: "Cases" },
    { href: "/gov/complaints", label: "Complaints" },
    { href: "/gov/field-reports", label: "Field Reports" },
    { href: "/gov/contractors", label: "Contractors" },
  ],
  DGMS_OFFICER: [
    { href: "/gov", label: "Map" },
    { href: "/gov/cases", label: "Cases" },
    { href: "/gov/complaints", label: "Complaints" },
    { href: "/gov/field-reports", label: "Field Reports" },
    { href: "/gov/contractors", label: "Contractors" },
  ],
  MINE_MANAGER: [
    { href: "/manager", label: "My Mine" },
    { href: "/manager/documents", label: "Documents" },
  ],
  FIELD_INSPECTOR: [{ href: "/inspector", label: "Assignments" }],
};

const NOTIFICATIONS_PATH: Record<string, string> = {
  MINISTRY_ADMIN: "/gov/notifications",
  DGMS_OFFICER: "/gov/notifications",
  MINE_MANAGER: "/manager/notifications",
  FIELD_INSPECTOR: "/inspector/notifications",
};

export async function SiteHeader() {
  const role = await getRole();
  const name = await getFullName();
  const t = await getT();
  const nav = role ? NAV[role] ?? [] : [];
  const unreadCount = role ? (await getNotifications()).filter((n) => !n.read).length : 0;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={role === "MINE_MANAGER" ? "/manager" : role === "FIELD_INSPECTOR" ? "/inspector" : "/gov"} className="font-mono text-sm font-semibold tracking-tight">
            KOYLANITI
          </Link>
          <nav className="flex gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleToggle />
          {role && (
            <Link href={NOTIFICATIONS_PATH[role]} className="relative text-sm text-muted-foreground hover:text-foreground" aria-label={t("Alerts")}>
              {t("Alerts")}
              {unreadCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--severity-critical)] px-1 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {name && <span className="text-sm text-muted-foreground">{name}</span>}
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              {t("Log out")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
