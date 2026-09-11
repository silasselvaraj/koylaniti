"use client";

import { useActionState } from "react";
import { submitComplaintAction, type SubmitComplaintResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicMine } from "@/lib/api";

const CATEGORIES = ["Safety", "Environmental", "Labour/Worker", "Corruption/Malpractice", "Other"];

const initialState: SubmitComplaintResult = { ok: true, id: "" };

export function ComplaintForm({ mines }: { mines: PublicMine[] }) {
  const [state, formAction, pending] = useActionState(submitComplaintAction, initialState);

  if (state.ok && state.id) {
    return (
      <Card>
        <CardContent className="space-y-3 py-5">
          <p className="text-sm font-medium text-[var(--band-green)]">Complaint received.</p>
          <p className="text-sm">
            Your complaint ID is <span className="font-mono font-semibold">{state.id}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Save this ID somewhere safe &mdash; it is the <b>only</b> way to check your complaint&rsquo;s status
            later, at <span className="font-mono">/complaint/status</span>. No identifying information about you
            has been recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-1">
            <Label htmlFor="mine_id">Mine</Label>
            <Select id="mine_id" name="mine_id" required defaultValue="">
              <option value="" disabled>
                Select the mine your complaint concerns
              </option>
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district}, {m.state})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">What happened?</Label>
            <Textarea id="description" name="description" rows={6} required placeholder="Describe your concern in as much detail as you can." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="photo">Photo (optional)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          {/* Honeypot: real visitors never see or fill this. Off-screen, not display:none,
              so a bot's automated form-filler still finds and fills it. */}
          <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {!state.ok && <p className="text-sm text-[var(--severity-critical)]">{state.error}</p>}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting..." : "Submit complaint"}
      </Button>
    </form>
  );
}
