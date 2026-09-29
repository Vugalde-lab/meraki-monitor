"use client";

import dynamic from "next/dynamic";
import type { LocationSummary } from "@/lib/meraki/health";

// Leaflet touches `window` at import time, so it can only load in the browser.
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center text-sm text-muted">
      Loading map…
    </div>
  ),
});

export function MapView({ locations }: { locations: LocationSummary[] }) {
  return <LocationMap locations={locations} />;
}
