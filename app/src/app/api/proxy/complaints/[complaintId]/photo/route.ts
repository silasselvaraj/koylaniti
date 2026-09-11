import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "@/lib/session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;
  const token = await getToken();
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const res = await fetch(`${API_BASE}/api/v1/complaints/${complaintId}/photo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return new NextResponse(null, { status: res.status });

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buf = await res.arrayBuffer();
  return new NextResponse(buf, { headers: { "Content-Type": contentType } });
}
