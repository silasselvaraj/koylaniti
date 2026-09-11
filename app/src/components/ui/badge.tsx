import * as React from "react";
import { cn } from "@/lib/utils";

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
  if (!band) return <Badge>Unscored</Badge>;
  return <Badge className={BAND_STYLE[band]}>{band}</Badge>;
}

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "bg-[var(--severity-low)] text-white border-transparent",
  MEDIUM: "bg-[var(--severity-medium)] text-white border-transparent",
  HIGH: "bg-[var(--severity-high)] text-white border-transparent",
  CRITICAL: "bg-[var(--severity-critical)] text-white border-transparent",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return <Badge className={SEVERITY_STYLE[severity] ?? ""}>{severity}</Badge>;
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

export const CASE_STATUS_LABEL: Record<string, string> = {
  EVIDENCE_SUBMITTED: "VERIFICATION PENDING",
};

export function caseStatusLabel(status: string): string {
  return CASE_STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}

export function CaseStatusBadge({ status }: { status: string }) {
  return <Badge className={STATUS_STYLE[status] ?? ""}>{caseStatusLabel(status)}</Badge>;
}

export function OverdueBadge({ isOverdue }: { isOverdue: boolean }) {
  if (!isOverdue) return null;
  return <Badge className="bg-[var(--severity-critical)] text-white border-transparent">OVERDUE</Badge>;
}
