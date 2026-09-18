"use client";

import dynamic from "next/dynamic";
import type { Mine } from "@/lib/api";
import { useI18n } from "@/lib/i18n/client";

const MineMap = dynamic(() => import("./mine-map").then((m) => m.MineMap), {
  ssr: false,
  loading: () => <LoadingMap />,
});

function LoadingMap() {
  const { t } = useI18n();
  return (
    <div className="flex h-[420px] w-full items-center justify-center rounded border border-border bg-surface-inset text-sm text-muted-foreground">
      {t("Loading map...")}
    </div>
  );
}

export function MineMapLoader({ mines }: { mines: Mine[] }) {
  return <MineMap mines={mines} />;
}
