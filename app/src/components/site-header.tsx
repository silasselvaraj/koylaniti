import Link from "next/link";
import { getFullName, getRole } from "@/lib/session";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const NAV: Record<string, { href: string; label: string }[]> = {
  MINISTRY_ADMIN: [
    { href: "/gov", label: "Map" },
    { href: "/gov/cases", label: "Cases" },
  ],
  DGMS_OFFICER: [
    { href: "/gov", label: "Map" },
    { href: "/gov/cases", label: "Cases" },
  ],
  MINE_MANAGER: [
    { href: "/manager", label: "My Mine" },
    { href: "/manager/documents", label: "Documents" },
  ],
  FIELD_INSPECTOR: [{ href: "/inspector", label: "Assignments" }],
};

export async function SiteHeader() {
  const role = await getRole();
  const name = await getFullName();
  const nav = role ? NAV[role] ?? [] : [];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={role === "MINE_MANAGER" ? "/manager" : role === "FIELD_INSPECTOR" ? "/inspector" : "/gov"} className="font-mono text-sm font-semibold tracking-tight">
            COAL COMPLIANCE MONITOR
          </Link>
          <nav className="flex gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {name && <span className="text-sm text-muted-foreground">{name}</span>}
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
