"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LocaleToggle } from "@/components/locale-toggle";
import { useI18n } from "@/lib/i18n/client";

const initialState: ActionResult = { ok: true };

export default function LoginPage() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-sm font-semibold tracking-tight">KOYLANITI</h1>
          <LocaleToggle />
        </div>
        <p className="text-sm text-muted-foreground mb-6">{t("SIH26024 — Smart Governance & Compliance Monitoring")}</p>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">{t("Username")}</Label>
            <Input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t("Password")}</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {!state.ok && <p className="text-sm text-[var(--severity-critical)]">{t(state.error)}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("Signing in...") : t("Sign in")}
          </Button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          {t("Demo accounts: admin, dgms_east, manager3, inspector1 — password")} <code>demo-2026</code>
        </p>
        <p className="mt-3 border-t border-border pt-3 text-center text-sm">
          <Link href="/complaint/new" className="text-accent underline">
            {t("Report a concern anonymously")}
          </Link>
        </p>
      </div>
    </div>
  );
}
