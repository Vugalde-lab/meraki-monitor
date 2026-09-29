import type { Metadata } from "next";
import { MapLegend } from "@/components/map/map-legend";
import { MapView } from "@/components/map/map-view";
import { PageHeader } from "@/components/page-header";
import { getDashboardData } from "@/lib/meraki/client";
import { summarizeLocations, type HealthLevel } from "@/lib/meraki/health";

export const metadata: Metadata = { title: "Map" };

export default async function MapPage() {
  const data = await getDashboardData();
  const locations = summarizeLocations(data);
  const unmapped = locations.filter(
    ({ location }) => location.lat === null || location.lng === null,
  );
  const healthCounts = locations.reduce<Record<HealthLevel, number>>(
    (acc, { health }) => ({ ...acc, [health]: acc[health] + 1 }),
    { healthy: 0, degraded: 0, critical: 0, unknown: 0 },
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Map"
        description="Each marker is a location. Select one to see its device health."
        fetchedAt={data.fetchedAt}
      />
      <MapLegend counts={healthCounts} />
      <div className="h-[60dvh] min-h-[420px] overflow-hidden rounded-lg border border-border bg-surface">
        <MapView locations={locations} />
      </div>
      {unmapped.length > 0 && (
        <p className="text-xs text-muted">
          Not shown (no device coordinates):{" "}
          {unmapped.map(({ location }) => location.name).join(", ")}
        </p>
      )}
    </div>
  );
}
