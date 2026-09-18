"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Upload a compliance document")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="doc_type">{t("Document type")}</Label>
            <Select id="doc_type" name="doc_type" required defaultValue="">
              <option value="" disabled>
                {t("Select type")}
              </option>
              {DOC_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {t(dt)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="raw_text">{t("Document text")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("Paste or type the document’s key text (permit number, issue date, expiry date). This stands in for OCR — AI will extract the structured fields from what you enter here.")}
            </p>
            <Textarea id="raw_text" name="raw_text" rows={6} placeholder={t("Environmental Clearance No. ... Valid until ...")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="file">{t("Attach file (optional)")}</Label>
            <Input id="file" name="file" type="file" />
          </div>
          {!state.ok && <p className="text-sm text-[var(--severity-critical)]">{t(state.error)}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? t("Uploading...") : t("Upload document")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
