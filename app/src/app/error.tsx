"use client";

import { useI18n } from "@/lib/i18n/client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm rounded border border-border bg-surface p-6 text-center">
        <p className="text-sm font-medium text-[var(--severity-critical)]">{t("Something went wrong")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t(error.message)}</p>
        <button
          onClick={reset}
          className="mt-4 h-9 rounded bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-strong"
        >
          {t("Try again")}
        </button>
      </div>
    </div>
  );
}
