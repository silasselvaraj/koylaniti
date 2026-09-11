import "server-only";
import { getToken } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Types (mirror backend/app/schemas.py) --------------------------------

export interface Mine {
  id: string;
  name: string;
  state: string;
  district: string;
  mine_type: string;
  latitude: number;
  longitude: number;
  boundary_polygon: number[][];
  current_score: number | null;
  current_band: "GREEN" | "YELLOW" | "RED" | null;
  last_scored_at: string | null;
}

export interface DomainBreakdown {
  score: number;
  weight: number;
  findings: Finding[];
}

export interface ScoreBreakdown {
  overall: number;
  band: "GREEN" | "YELLOW" | "RED";
  domains: Record<"STATUTORY" | "SAFETY" | "ENVIRONMENTAL" | "OPERATIONAL", DomainBreakdown>;
  mine_id: string;
  case_id: string | null;
}

export interface Finding {
  id: number;
  rule_id: string | null;
  domain: string;
  source_type: "DOCUMENT" | "INSPECTION" | "SATELLITE" | "OPERATIONAL";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  description: string;
  score_impact: number;
  detail: Record<string, unknown>;
  case_id: string | null;
  contractor_id: string | null;
  detected_at: string;
}

export interface DocumentRow {
  id: string;
  mine_id: string;
  doc_type: string;
  filename: string;
  size: number;
  raw_text: string | null;
  extracted_issue_date: string | null;
  extracted_expiry_date: string | null;
  extracted_permit_number: string | null;
  extraction_status: "PENDING" | "DONE" | "FAILED";
  created_at: string;
}

export interface Inspection {
  id: string;
  client_id: string;
  mine_id: string;
  inspector_user_id: number;
  case_id: string | null;
  report_type: string;
  checklist_answers: { item_id: string; label: string; passed: boolean; notes: string }[];
  gps_lat: number | null;
  gps_lng: number | null;
  notes: string | null;
  sync_status: string;
  submitted_at: string | null;
  created_at: string;
  has_photo: boolean;
}

export interface Case {
  id: string;
  mine_id: string;
  status: "DETECTED" | "TRIAGED" | "ASSIGNED" | "INSPECTION_REMEDIATION" | "EVIDENCE_SUBMITTED" | "VERIFIED" | "CLOSED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  ai_brief: string | null;
  assigned_to_user_id: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  due_date: string | null;
  escalation_target: string | null;
  is_overdue: boolean;
}

export interface UserRow {
  id: number;
  username: string;
  role: string;
  full_name: string;
  jurisdiction_state: string | null;
  mine_id: string | null;
}

export interface NotificationRow {
  id: number;
  case_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Me {
  id: number;
  username: string;
  role: string;
  full_name: string;
  jurisdiction_state: string | null;
  mine_id: string | null;
}

export interface Rule {
  id: string;
  domain: string;
  source: string;
  description: string;
  severity: string;
  evidence_required: string;
  check_type: string;
}

export interface AuditLogRow {
  id: number;
  event_type: string;
  mine_id: string | null;
  case_id: string | null;
  user_id: number | null;
  detail: string | null;
  created_at: string;
}

export interface Contractor {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  license_number: string | null;
  specialization: string | null;
  created_at: string;
}

export interface PublicMine {
  id: string;
  name: string;
  state: string;
  district: string;
}

export interface ComplaintStatus {
  id: string;
  status: "NEW" | "UNDER_REVIEW" | "ESCALATED" | "DISMISSED";
  created_at: string;
}

export interface Complaint {
  id: string;
  mine_id: string;
  category: string;
  description: string;
  status: "NEW" | "UNDER_REVIEW" | "ESCALATED" | "DISMISSED";
  case_id: string | null;
  reviewed_by_user_id: number | null;
  review_notes: string | null;
  ai_summary: string | null;
  created_at: string;
  has_photo: boolean;
}

export interface SatelliteFinding {
  mine_id: string;
  rule_id: string;
  before_image: string;
  after_image: string;
  before_date: string;
  after_date: string;
  ndvi_loss_pct: number;
  anomaly_polygon: number[][];
  severity: string;
  description: string;
}

// --- Calls ------------------------------------------------------------------

export const getMe = () => apiFetch<Me>(`/api/v1/auth/me`);

export const getMines = (params?: { state?: string; risk?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Mine[]>(`/api/v1/mines${q ? `?${q}` : ""}`);
};

export const getMine = (mineId: string) => apiFetch<Mine>(`/api/v1/mines/${mineId}`);

export const getMineCompliance = (mineId: string) => apiFetch<ScoreBreakdown>(`/api/v1/mines/${mineId}/compliance`);

export const getMineFindings = (mineId: string) => apiFetch<Finding[]>(`/api/v1/mines/${mineId}/findings`);

export const getMineDocuments = (mineId: string) => apiFetch<DocumentRow[]>(`/api/v1/documents/mine/${mineId}`);

export const getMineMonitoring = (mineId: string) =>
  apiFetch<SatelliteFinding>(`/api/v1/monitoring/mines/${mineId}`).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });

export const getCases = (params?: { status?: string; severity?: string; mine_id?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Case[]>(`/api/v1/cases${q ? `?${q}` : ""}`);
};

export const getCase = (caseId: string) => apiFetch<Case>(`/api/v1/cases/${caseId}`);

export const getCaseInspections = (caseId: string) => apiFetch<Inspection[]>(`/api/v1/inspections?case_id=${caseId}`);

export const getStandaloneInspections = () => apiFetch<Inspection[]>(`/api/v1/inspections?standalone=true`);

export const getCaseAudit = (caseId: string) => apiFetch<AuditLogRow[]>(`/api/v1/cases/${caseId}/audit`);

export const getRules = (domain?: string) => apiFetch<Rule[]>(`/api/v1/rules${domain ? `?domain=${domain}` : ""}`);

export const getContractors = () => apiFetch<Contractor[]>(`/api/v1/contractors`);

export const getContractor = (contractorId: string) =>
  apiFetch<{ contractor: Contractor; findings: Finding[]; open_case_ids: string[] }>(
    `/api/v1/contractors/${contractorId}`
  );

// Public (unauthenticated) - apiFetch simply omits the Authorization header when no
// session cookie exists, which is exactly right for a logged-out visitor.
export const getPublicMines = () => apiFetch<PublicMine[]>(`/api/v1/public/mines`);

export const getComplaintStatus = (complaintId: string) =>
  apiFetch<ComplaintStatus>(`/api/v1/public/complaints/${complaintId}/status`);

export const getComplaints = (status?: string) =>
  apiFetch<Complaint[]>(`/api/v1/complaints${status ? `?status=${status}` : ""}`);

export const getComplaint = (complaintId: string) => apiFetch<Complaint>(`/api/v1/complaints/${complaintId}`);

export const getComplaintsForCase = async (caseId: string): Promise<Complaint[]> => {
  const all = await getComplaints();
  return all.filter((c) => c.case_id === caseId);
};

export const getUsers = (params?: { role?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<UserRow[]>(`/api/v1/users${q ? `?${q}` : ""}`);
};

export const getNotifications = () => apiFetch<NotificationRow[]>(`/api/v1/notifications`);

export const getComplianceReport = (state?: string) =>
  apiFetch<{ total_mines: number; band_counts: Record<string, number>; case_counts: Record<string, number>; avg_score: number | null }>(
    `/api/v1/reports/compliance${state ? `?state=${state}` : ""}`
  );
