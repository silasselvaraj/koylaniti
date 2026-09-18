"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { setLocaleAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function LocaleToggle() {
  const { locale } = useI18n();
  const router = useRouter();

  async function switchTo(next: "en" | "hi") {
    if (next === locale) return;
    await setLocaleAction(next);
    router.refresh();
  }

  const base =
    "rounded px-2 py-1 text-xs font-medium transition-colors";

  return (
    <div className="flex items-center rounded border border-border bg-surface-inset p-0.5">
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={cn(base, locale === "en" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("hi")}
        aria-pressed={locale === "hi"}
        className={cn(base, locale === "hi" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        हिंदी
      </button>
    </div>
  );
}
