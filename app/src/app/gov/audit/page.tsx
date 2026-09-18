import { getAuditChainVerification } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getT } from "@/lib/i18n/server";

export default async function AuditIntegrityPage() {
  const t = await getT();
  const result = await getAuditChainVerification();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t("Audit Chain Integrity")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{result.valid ? t("Chain verified") : t("Integrity break detected")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className={result.valid ? "text-[var(--band-green)]" : "text-[var(--severity-critical)]"}>
            {result.valid
              ? t("All {count} audit event(s) recomputed cleanly - each row's hash still matches its recorded content and the previous row's hash.", { count: result.total_events })
              : t("A mismatch was found at audit event #{id}. This event's stored hash no longer matches its content, or the chain to the previous event is broken - the underlying data has been altered or removed since it was written.", { id: result.broken_at_id ?? "" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("Every audit event’s hash is SHA-256 of its own content plus the previous event’s hash, computed at write time. Recomputing the whole chain and comparing it against what was stored is how tampering gets detected here - the app never updates or deletes an audit row itself. This detects tampering; it doesn’t prevent a privileged database user from editing rows directly.")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
