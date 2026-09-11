import { getAuditChainVerification } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuditIntegrityPage() {
  const result = await getAuditChainVerification();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Audit Chain Integrity</h1>
      <Card>
        <CardHeader>
          <CardTitle>{result.valid ? "Chain verified" : "Integrity break detected"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className={result.valid ? "text-[var(--band-green)]" : "text-[var(--severity-critical)]"}>
            {result.valid
              ? `All ${result.total_events} audit event(s) recomputed cleanly - each row's hash still matches its recorded content and the previous row's hash.`
              : `A mismatch was found at audit event #${result.broken_at_id}. This event's stored hash no longer matches its content, or the chain to the previous event is broken - the underlying data has been altered or removed since it was written.`}
          </p>
          <p className="text-xs text-muted-foreground">
            Every audit event&rsquo;s hash is SHA-256 of its own content plus the previous event&rsquo;s hash, computed at
            write time. Recomputing the whole chain and comparing it against what was stored is how tampering
            gets detected here - the app never updates or deletes an audit row itself. This detects tampering;
            it doesn&rsquo;t prevent a privileged database user from editing rows directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
