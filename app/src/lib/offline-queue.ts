export interface QueuedInspection {
  client_id: string;
  mine_id: string;
  case_id: string | null;
  checklist_answers: { item_id: string; label: string; passed: boolean; notes: string }[];
  gps_lat: number | null;
  gps_lng: number | null;
  notes: string | null;
  submitted_at: string;
  photo_base64: string | null;
  photo_content_type: string | null;
}

const KEY = "sih_offline_queue";

export function readQueue(): QueuedInspection[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedInspection[]) : [];
  } catch {
    return [];
  }
}

export function enqueue(item: QueuedInspection) {
  try {
    const queue = readQueue();
    queue.push(item);
    localStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
    // localStorage unavailable (private mode, quota) - nothing we can do client-side here
  }
}

export function clearQueue() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
