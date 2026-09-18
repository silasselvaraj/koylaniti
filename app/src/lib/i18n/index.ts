import { hi } from "./hi";

export type Locale = "en" | "hi";

/** Translate a source string (key-as-source-language). Falls back to the source
 * text when no translation exists, so English always works. Supports simple
 * `{name}` placeholder interpolation via `vars`. */
export function translate(
  locale: Locale,
  text: string,
  vars?: Record<string, string | number>
): string {
  if (locale !== "hi") return text;
  let out = hi[text] ?? text;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      out = out.split(`{${key}}`).join(String(value));
    }
  }
  return out;
}
