"use client";

import dynamic from "next/dynamic";
import type { Mine } from "@/lib/api";

const MineMap = dynamic(() => import("./mine-map").then((m) => m.MineMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded border border-border bg-surface-inset text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

export function MineMapLoader({ mines }: { mines: Mine[] }) {
  return <MineMap mines={mines} />;
}
