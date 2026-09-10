import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

const ROLE_PREFIX: Record<string, string> = {
  MINISTRY_ADMIN: "/gov",
  DGMS_OFFICER: "/gov",
  MINE_MANAGER: "/manager",
  FIELD_INSPECTOR: "/inspector",
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  const token = request.cookies.get("sih_token")?.value;
  const role = request.cookies.get("sih_role")?.value;

  if (!token || !role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Optimistic role-based routing only (no DB hit here) - the FastAPI require_role
  // dependency is the real enforcement on every API call.
  const allowedPrefix = ROLE_PREFIX[role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gov/:path*", "/manager/:path*", "/inspector/:path*"],
};
