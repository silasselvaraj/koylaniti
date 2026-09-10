"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DOC_TYPES = [
  "Environmental Clearance",
  "Forest Clearance",
  "Mining Plan Approval",
  "Consent to Operate",
  "Safety Certificate",
  "Other",
];

const initialState: ActionResult = { ok: true };

export default function UploadDocumentPage() {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a compliance document</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="doc_type">Document type</Label>
            <Select id="doc_type" name="doc_type" required defaultValue="">
              <option value="" disabled>
                Select type
              </option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="raw_text">Document text</Label>
            <p className="text-xs text-muted-foreground">
              Paste or type the document&rsquo;s key text (permit number, issue date, expiry date). This stands in
              for OCR &mdash; AI will extract the structured fields from what you enter here.
            </p>
            <Textarea id="raw_text" name="raw_text" rows={6} placeholder="Environmental Clearance No. ... Valid until ..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="file">Attach file (optional)</Label>
            <Input id="file" name="file" type="file" />
          </div>
          {!state.ok && <p className="text-sm text-[var(--severity-critical)]">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Upload document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
