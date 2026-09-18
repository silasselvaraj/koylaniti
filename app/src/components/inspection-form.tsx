"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createInspectionAction, syncBatchAction } from "@/lib/actions";
import { enqueue, readQueue, clearQueue, type QueuedInspection } from "@/lib/offline-queue";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/client";
import type { Mine } from "@/lib/api";

const CHECKLIST_ITEMS = [
  { item_id: "ventilation_gas_monitoring", label: "Ventilation / gas monitoring functioning" },
  { item_id: "emergency_equipment", label: "Fire-fighting / emergency equipment available" },
  { item_id: "ppe_compliance", label: "Workers wearing required PPE" },
  { item_id: "signage_barricading", label: "Safety signage and barricading in place" },
];

const REPORT_TYPES = ["Compliance Observation", "Safety Incident", "Environmental Observation", "Operational Exception"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function InspectionForm({
  mineId,
  caseId,
  mines,
}: {
  mineId: string | null;
  caseId: string | null;
  mines?: Mine[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, { passed: boolean; notes: string }>>(
    Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.item_id, { passed: true, notes: "" }]))
  );
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [selectedMineId, setSelectedMineId] = useState(mines?.[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // One-time read of localStorage (an external system) on mount - not a React state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueueSize(readQueue().length);
  }, []);

  function captureGps() {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError(t("Geolocation not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGpsError(err.message || t("Could not get location. Enter it manually below.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const effectiveMineId = mineId ?? selectedMineId;
    if (!effectiveMineId) {
      setMessage(t("Select a mine."));
      return;
    }
    setSubmitting(true);
    setMessage(null);

    let photoBase64: string | null = null;
    let photoContentType: string | null = null;
    if (photoFile) {
      photoBase64 = await fileToBase64(photoFile);
      photoContentType = photoFile.type;
    }

    const payload: QueuedInspection = {
      client_id: crypto.randomUUID(),
      mine_id: effectiveMineId,
      case_id: caseId,
      report_type: reportType,
      checklist_answers: CHECKLIST_ITEMS.map((i) => ({
        item_id: i.item_id,
        label: i.label,
        passed: answers[i.item_id].passed,
        notes: answers[i.item_id].notes,
      })),
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      notes: notes || null,
      submitted_at: new Date().toISOString(),
      photo_base64: photoBase64,
      photo_content_type: photoContentType,
    };

    if (offlineMode) {
      enqueue(payload);
      setQueueSize(readQueue().length);
      setMessage(t("Saved offline. It will upload once you reconnect and sync."));
      setSubmitting(false);
      return;
    }

    const result = await createInspectionAction(payload);
    setSubmitting(false);
    if (result.ok) {
      router.push("/inspector");
    } else {
      setMessage(result.error);
    }
  }

  async function handleSync() {
    const queue = readQueue();
    if (queue.length === 0) return;
    setSubmitting(true);
    const result = await syncBatchAction(queue);
    setSubmitting(false);
    if (result.ok) {
      clearQueue();
      setQueueSize(0);
      setMessage(t("Synced {count} inspection(s).", { count: queue.length }));
    } else {
      setMessage(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={offlineMode} onChange={(e) => setOfflineMode(e.target.checked)} />
            {t("Simulate offline (no network)")}
          </label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t("Pending sync: ")}{queueSize}</span>
            <Button type="button" size="sm" variant="secondary" disabled={queueSize === 0 || submitting} onClick={handleSync}>
              {t("Reconnect & sync")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Report details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="report_type">{t("Field report type")}</Label>
              <Select id="report_type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                {REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {t(rt)}
                  </option>
                ))}
              </Select>
            </div>
            {mineId === null && (
              <div className="space-y-1">
                <Label htmlFor="mine_id">{t("Mine")}</Label>
                <Select id="mine_id" value={selectedMineId} onChange={(e) => setSelectedMineId(e.target.value)} required>
                  <option value="" disabled>
                    {t("Select a mine")}
                  </option>
                  {(mines ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Checklist")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item.item_id} className="space-y-1 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t(item.label)}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [item.item_id]: { ...a[item.item_id], passed: true } }))}
                      className={`rounded px-3 py-1 text-xs ${answers[item.item_id].passed ? "bg-[var(--band-green)] text-white" : "bg-surface-inset"}`}
                    >
                      {t("Pass")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [item.item_id]: { ...a[item.item_id], passed: false } }))}
                      className={`rounded px-3 py-1 text-xs ${!answers[item.item_id].passed ? "bg-[var(--severity-critical)] text-white" : "bg-surface-inset"}`}
                    >
                      {t("Fail")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Location & evidence")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Button type="button" variant="secondary" onClick={captureGps}>
                {t("Capture GPS location")}
              </Button>
              {gps && <p className="mt-1 text-xs text-muted-foreground">{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</p>}
              {gpsError && <p className="mt-1 text-xs text-[var(--severity-critical)]">{gpsError}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="photo">{t("Photo")}</Label>
              <Input id="photo" type="file" accept="image/*" capture="environment" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {message && <p className="text-sm">{message}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t("Submitting...") : offlineMode ? t("Save offline") : t("Submit inspection")}
        </Button>
      </form>
    </div>
  );
}
