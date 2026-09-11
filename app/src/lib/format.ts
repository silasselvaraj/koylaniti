/** Rule ids (e.g. "CMR-SAFE-001") are internal KoylaNiti identifiers, not official
 * regulation citations - always label them as such rather than showing a bare code
 * that could pass for an official reference. */
export function formatRuleId(ruleId: string | null): string {
  return ruleId ? `KoylaNiti Control ID: ${ruleId}` : "—";
}
