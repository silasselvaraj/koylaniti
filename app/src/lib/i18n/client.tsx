"use client";

import { createContext, useContext } from "react";
import { translate, type Locale } from "./index";

type I18nContextValue = {
  locale: Locale;
  t: (text: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (text) => text,
});

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value: I18nContextValue = {
    locale,
    t: (text, vars) => translate(locale, text, vars),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
