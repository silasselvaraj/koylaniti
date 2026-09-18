"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { caseStatusLabel } from "@/lib/status-labels";

export { caseStatusLabel };

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border border-border bg-surface-inset",
        className
      )}
      {...props}
    />
  );
}

const BAND_STYLE: Record<string, string> = {
  GREEN: "bg-[var(--band-green)] text-white border-transparent",
  YELLOW: "bg-[var(--band-yellow)] text-white border-transparent",
  RED: "bg-[var(--band-red)] text-white border-transparent",
};

export function BandBadge({ band }: { band: string | null }) {
  const { t } = useI18n();
  if (!band) return <Badge>{t("Unscored")}</Badge>;
  return <Badge className={BAND_STYLE[band]}>{t(band)}</Badge>;
}

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "bg-[var(--severity-low)] text-white border-transparent",
  MEDIUM: "bg-[var(--severity-medium)] text-white border-transparent",
  HIGH: "bg-[var(--severity-high)] text-white border-transparent",
  CRITICAL: "bg-[var(--severity-critical)] text-white border-transparent",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const { t } = useI18n();
  return <Badge className={SEVERITY_STYLE[severity] ?? ""}>{t(severity)}</Badge>;
}

const STATUS_STYLE: Record<string, string> = {
  DETECTED: "bg-surface-inset",
  TRIAGED: "bg-surface-inset",
  ASSIGNED: "bg-[var(--severity-medium)] text-white border-transparent",
  INSPECTION_REMEDIATION: "bg-[var(--severity-medium)] text-white border-transparent",
  EVIDENCE_SUBMITTED: "bg-[var(--band-yellow)] text-white border-transparent",
  VERIFIED: "bg-[var(--band-green)] text-white border-transparent",
  CLOSED: "bg-[var(--band-green)] text-white border-transparent",
};

export function CaseStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Badge className={STATUS_STYLE[status] ?? ""}>{t(caseStatusLabel(status))}</Badge>;
}

export function OverdueBadge({ isOverdue }: { isOverdue: boolean }) {
  const { t } = useI18n();
  if (!isOverdue) return null;
  return <Badge className="bg-[var(--severity-critical)] text-white border-transparent">{t("OVERDUE")}</Badge>;
}
