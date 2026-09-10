import "server-only";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "sih_token";
const ROLE_COOKIE = "sih_role";
const NAME_COOKIE = "sih_name";

export type Role = "MINISTRY_ADMIN" | "DGMS_OFFICER" | "MINE_MANAGER" | "FIELD_INSPECTOR";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return (store.get(ROLE_COOKIE)?.value as Role) ?? null;
}

export async function getFullName(): Promise<string | null> {
  const store = await cookies();
  return store.get(NAME_COOKIE)?.value ?? null;
}

export async function setSession(token: string, role: Role, fullName: string) {
  const store = await cookies();
  const opts = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 };
  store.set(TOKEN_COOKIE, token, opts);
  store.set(ROLE_COOKIE, role, opts);
  store.set(NAME_COOKIE, fullName, opts);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(ROLE_COOKIE);
  store.delete(NAME_COOKIE);
}

export function landingPathForRole(role: Role): string {
  if (role === "MINE_MANAGER") return "/manager";
  if (role === "FIELD_INSPECTOR") return "/inspector";
  return "/gov";
}
