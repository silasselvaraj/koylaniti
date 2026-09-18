import "server-only";
import { cookies } from "next/headers";
import { translate, type Locale } from "./index";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "hi" ? "hi" : "en";
}

/** Convenience for server components: returns a translator bound to the
 * request's locale. */
export async function getT() {
  const locale = await getLocale();
  return (text: string, vars?: Record<string, string | number>) => translate(locale, text, vars);
}
