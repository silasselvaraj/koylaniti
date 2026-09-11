"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionResult = { ok: true };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded border border-border bg-surface p-6">
        <h1 className="font-mono text-sm font-semibold tracking-tight mb-1">KOYLANITI</h1>
        <p className="text-sm text-muted-foreground mb-6">SIH26024 &mdash; Smart Governance &amp; Compliance Monitoring</p>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {!state.ok && <p className="text-sm text-[var(--severity-critical)]">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          Demo accounts: admin, dgms_east, manager3, inspector1 &mdash; password <code>demo-2026</code>
        </p>
        <p className="mt-3 border-t border-border pt-3 text-center text-sm">
          <Link href="/complaint/new" className="text-accent underline">
            Report a concern anonymously
          </Link>
        </p>
      </div>
    </div>
  );
}
