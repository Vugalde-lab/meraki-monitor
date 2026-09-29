"use client";

import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import {
  HEALTH_COLORS,
  HEALTH_LABELS,
  PRODUCT_TYPE_LABELS,
  type LocationSummary,
} from "@/lib/meraki/health";
import type { ProductType } from "@/lib/meraki/types";

type MappedLocation = LocationSummary & {
  location: LocationSummary["location"] & { lat: number; lng: number };
};

export function hasCoordinates(summary: LocationSummary): summary is MappedLocation {
  return summary.location.lat !== null && summary.location.lng !== null;
}

export default function LocationMap({ locations }: { locations: LocationSummary[] }) {
  const mapped = locations.filter(hasCoordinates);
  const bounds = latLngBounds(mapped.map(({ location }) => [location.lat, location.lng]));

  return (
    <MapContainer
      bounds={mapped.length > 0 ? bounds.pad(0.2) : undefined}
      center={mapped.length > 0 ? undefined : [39.5, -98.35]}
      zoom={mapped.length > 0 ? undefined : 4}
      scrollWheelZoom={false}
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {mapped.map(({ location, counts, byType, health }) => (
        <CircleMarker
          key={location.id}
          center={[location.lat, location.lng]}
          radius={10}
          pathOptions={{
            color: "#0b0d10",
            weight: 2,
            fillColor: HEALTH_COLORS[health],
            fillOpacity: 0.95,
          }}
        >
          <Popup minWidth={220}>
            <div className="flex flex-col gap-2 text-foreground">
              <div>
                <p className="text-sm font-semibold">{location.name}</p>
                {location.address && <p className="text-xs text-muted">{location.address}</p>}
              </div>
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: HEALTH_COLORS[health] }}
                  aria-hidden="true"
                />
                {HEALTH_LABELS[health]}
                <span className="font-normal text-muted">
                  · {counts.online}/{counts.total} online
                </span>
              </p>
              <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-xs">
                {(Object.entries(byType) as [ProductType, { total: number; online: number }][]).map(
                  ([type, { total, online }]) => (
                    <div key={type} className="contents">
                      <dt className="text-muted">{PRODUCT_TYPE_LABELS[type]}s</dt>
                      <dd className="text-right tabular-nums">
                        {online}/{total}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
              {(counts.alerting > 0 || counts.offline > 0) && (
                <p className="text-xs">
                  {counts.offline > 0 && (
                    <span className="text-danger">{counts.offline} offline</span>
                  )}
                  {counts.offline > 0 && counts.alerting > 0 && " · "}
                  {counts.alerting > 0 && (
                    <span className="text-warning">{counts.alerting} alerting</span>
                  )}
                </p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
