import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiError, getComplaint, getMine } from "@/lib/api";
import { dismissComplaintAction, escalateComplaintAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const { complaintId } = await params;

  let complaint;
  try {
    complaint = await getComplaint(complaintId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const mine = await getMine(complaint.mine_id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            {complaint.category} &middot; {mine.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {complaint.id} &middot; submitted {new Date(complaint.created_at).toLocaleString()} &middot; submitted
            anonymously, no identity on file
          </p>
        </div>
        <Badge>{complaint.status.replace(/_/g, " ")}</Badge>
      </div>

      {complaint.case_id && (
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm">
              Escalated to case <span className="font-mono">{complaint.case_id}</span>
            </span>
            <Link
              href={`/gov/cases/${complaint.case_id}`}
              className="inline-flex h-10 items-center justify-center rounded bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-strong"
            >
              Open case
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {complaint.ai_summary ?? <span className="text-muted-foreground">Summary pending...</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full complaint text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="whitespace-pre-wrap text-sm">{complaint.description}</p>
          {complaint.has_photo && (
            <img
              src={`/api/proxy/complaints/${complaint.id}/photo`}
              alt="Complaint evidence"
              className="max-h-80 rounded border border-border"
            />
          )}
        </CardContent>
      </Card>

      {complaint.review_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Review notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{complaint.review_notes}</CardContent>
        </Card>
      )}

      {(complaint.status === "NEW" || complaint.status === "UNDER_REVIEW") && (
        <Card>
          <CardHeader>
            <CardTitle>Triage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={escalateComplaintAction.bind(null, complaint.id)} className="space-y-2">
              <Label htmlFor="escalate-notes">Escalate for field verification</Label>
              <Textarea id="escalate-notes" name="notes" rows={2} placeholder="Why this warrants an inspection..." />
              <Button type="submit">Escalate to case</Button>
            </form>
            <form action={dismissComplaintAction.bind(null, complaint.id)} className="space-y-2 border-t border-border pt-4">
              <Label htmlFor="dismiss-notes">Dismiss</Label>
              <Textarea id="dismiss-notes" name="notes" rows={2} placeholder="Reason for dismissal..." />
              <Button type="submit" variant="secondary">
                Dismiss complaint
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
