import Link from "next/link";
import { ApiError, getComplaintStatus } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Received, not yet reviewed",
  UNDER_REVIEW: "Under review",
  ESCALATED: "Escalated for field verification",
  DISMISSED: "Reviewed, no further action",
};

export default async function ComplaintStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let notFound = false;
  let status: Awaited<ReturnType<typeof getComplaintStatus>> | null = null;

  if (id) {
    try {
      status = await getComplaintStatus(id.trim());
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) notFound = true;
      else throw e;
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <h1 className="text-lg font-semibold">Check complaint status</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the complaint ID you were given at submission.</p>

      <form action="/complaint/status" method="GET" className="mt-6 flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="id">Complaint ID</Label>
          <Input id="id" name="id" defaultValue={id ?? ""} placeholder="COMP-1000" />
        </div>
        <Button type="submit">Check</Button>
      </form>

      {notFound && (
        <p className="mt-4 text-sm text-[var(--severity-critical)]">No complaint found with that ID.</p>
      )}

      {status && (
        <Card className="mt-4">
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{status.id}</span>
              <Badge>{status.status}</Badge>
            </div>
            <p className="text-sm">{STATUS_LABEL[status.status] ?? status.status}</p>
            <p className="text-xs text-muted-foreground">Submitted {new Date(status.created_at).toLocaleString()}</p>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        <Link href="/complaint/new" className="text-accent underline">
          File a new complaint
        </Link>
      </p>
    </div>
  );
}
