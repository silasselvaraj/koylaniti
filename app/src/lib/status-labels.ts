// Pure label helpers shared by server and client components. Kept out of
// badge.tsx so the badge components can be "use client" without dragging a
// hook-only module into server components.

export const CASE_STATUS_LABEL: Record<string, string> = {
  EVIDENCE_SUBMITTED: "VERIFICATION PENDING",
};

export function caseStatusLabel(status: string): string {
  return CASE_STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}
