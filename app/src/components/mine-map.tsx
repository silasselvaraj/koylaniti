"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Mine } from "@/lib/api";
import { useI18n } from "@/lib/i18n/client";

const BAND_COLOR: Record<string, string> = {
  GREEN: "#2F7A4F",
  YELLOW: "#B0791A",
  RED: "#A33A2E",
};

export function MineMap({ mines }: { mines: Mine[] }) {
  const { t } = useI18n();
  const center: [number, number] =
    mines.length > 0
      ? [mines.reduce((s, m) => s + m.latitude, 0) / mines.length, mines.reduce((s, m) => s + m.longitude, 0) / mines.length]
      : [22.5, 82.5];

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom={true} style={{ height: "420px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mines.map((mine) => (
        <CircleMarker
          key={mine.id}
          center={[mine.latitude, mine.longitude]}
          radius={9}
          pathOptions={{
            color: BAND_COLOR[mine.current_band ?? ""] ?? "#888",
            fillColor: BAND_COLOR[mine.current_band ?? ""] ?? "#888",
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{mine.name}</div>
              <div className="text-muted-foreground">
                {mine.district}, {mine.state}
              </div>
              <div className="mt-1">
                {t("Score:")} {mine.current_score?.toFixed(0) ?? "—"} ({t(mine.current_band ?? "Unscored")})
              </div>
              <Link href={`/gov/mines/${mine.id}`} className="text-accent underline">
                {t("View details")}
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
