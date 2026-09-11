"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./api";
import { clearSession, landingPathForRole, setSession, type Role } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function loginAction(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false, error: res.status === 401 ? "Invalid username or password." : "Login failed. Try again." };
  }
  const data = await res.json();
  await setSession(data.access_token, data.role as Role, data.full_name);
  redirect(landingPathForRole(data.role as Role));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

function actionError(e: unknown): ActionResult {
  if (e instanceof ApiError) return { ok: false, error: e.message || `Request failed (${e.status})` };
  return { ok: false, error: "Something went wrong." };
}

function toError(e: unknown): Error {
  if (e instanceof ApiError) return new Error(e.message || `Request failed (${e.status})`);
  return e instanceof Error ? e : new Error("Something went wrong.");
}

// Below: plain <form action={fn}> targets. React types these as returning void, so
// they throw on failure (caught by the nearest error.tsx) rather than returning
// ActionResult - unlike the useActionState-driven forms above which show inline errors.

export async function assignCaseAction(caseId: string, formData: FormData): Promise<void> {
  const userId = Number(formData.get("user_id"));
  if (!userId) throw new Error("Select an inspector.");
  const dueDateRaw = String(formData.get("due_date") ?? "").trim();
  const escalationTarget = String(formData.get("escalation_target") ?? "").trim();
  try {
    await apiFetch(`/api/v1/cases/${caseId}/assign`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        due_date: dueDateRaw ? new Date(dueDateRaw).toISOString() : null,
        escalation_target: escalationTarget || null,
      }),
    });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/gov/cases/${caseId}`);
  revalidatePath("/gov/cases");
  revalidatePath("/gov");
}

export async function verifyCaseAction(caseId: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/cases/${caseId}/verify`, { method: "POST" });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/gov/cases/${caseId}`);
}

export async function resolveCaseAction(caseId: string, formData: FormData): Promise<void> {
  const reason = String(formData.get("reason") ?? "").trim() || "Verified and resolved.";
  try {
    await apiFetch(`/api/v1/cases/${caseId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/gov/cases/${caseId}`);
  revalidatePath("/gov/cases");
  revalidatePath("/gov");
}

export async function submitEvidenceAction(caseId: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/cases/${caseId}/evidence`, { method: "POST" });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/manager/cases/${caseId}`);
  revalidatePath(`/gov/cases/${caseId}`);
}

export async function uploadDocumentAction(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await apiFetch(`/api/v1/documents`, { method: "POST", body: formData });
  } catch (e) {
    return actionError(e);
  }
  revalidatePath("/manager");
  redirect("/manager");
}

export async function createInspectionAction(payload: {
  client_id: string;
  mine_id: string;
  case_id: string | null;
  checklist_answers: { item_id: string; label: string; passed: boolean; notes: string }[];
  gps_lat: number | null;
  gps_lng: number | null;
  notes: string | null;
  submitted_at: string;
}): Promise<ActionResult> {
  try {
    await apiFetch(`/api/v1/inspections`, { method: "POST", body: JSON.stringify(payload) });
    revalidatePath("/inspector");
    if (payload.case_id) revalidatePath(`/gov/cases/${payload.case_id}`);
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}

export async function syncBatchAction(items: unknown[]): Promise<ActionResult> {
  try {
    await apiFetch(`/api/v1/sync/batch`, { method: "POST", body: JSON.stringify(items) });
    revalidatePath("/inspector");
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}

export async function markNotificationReadAction(notificationId: number, path: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/notifications/${notificationId}/read`, { method: "POST" });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(path);
}

export async function reviewFieldReportAction(inspectionId: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/inspections/${inspectionId}/review`, { method: "POST" });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath("/gov/field-reports");
}

export type SubmitComplaintResult = { ok: true; id: string } | { ok: false; error: string };

export async function submitComplaintAction(
  _prevState: unknown,
  formData: FormData
): Promise<SubmitComplaintResult> {
  try {
    const result = await apiFetch<{ id: string }>(`/api/v1/public/complaints`, {
      method: "POST",
      body: formData,
    });
    return { ok: true, id: result.id };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message || "Submission failed." : "Submission failed." };
  }
}

export async function dismissComplaintAction(complaintId: string, formData: FormData): Promise<void> {
  const notes = String(formData.get("notes") ?? "").trim() || null;
  try {
    await apiFetch(`/api/v1/complaints/${complaintId}/dismiss`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/gov/complaints/${complaintId}`);
  revalidatePath("/gov/complaints");
}

export async function escalateComplaintAction(complaintId: string, formData: FormData): Promise<void> {
  const notes = String(formData.get("notes") ?? "").trim() || null;
  let caseId: string | null = null;
  try {
    const result = await apiFetch<{ case_id: string | null }>(`/api/v1/complaints/${complaintId}/escalate`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    caseId = result.case_id;
  } catch (e) {
    throw toError(e);
  }
  revalidatePath(`/gov/complaints/${complaintId}`);
  revalidatePath("/gov/complaints");
  revalidatePath("/gov/cases");
  if (caseId) redirect(`/gov/cases/${caseId}`);
}
