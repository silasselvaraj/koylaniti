"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline installability is a progressive enhancement - a failed registration
        // (unsupported browser, blocked by policy) should never break the page
      });
    }
  }, []);

  return null;
}
