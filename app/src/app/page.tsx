import { redirect } from "next/navigation";
import { getRole, landingPathForRole } from "@/lib/session";

export default async function RootPage() {
  const role = await getRole();
  redirect(role ? landingPathForRole(role) : "/login");
}
