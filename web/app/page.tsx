import { DeviceTypeBreakdown } from "@/components/overview/device-type-breakdown";
import { LocationHealthList } from "@/components/overview/location-health-list";
import { ProblemDevices } from "@/components/overview/problem-devices";
import { StatCards } from "@/components/overview/stat-cards";
import { PageHeader } from "@/components/page-header";
import { getDashboardData } from "@/lib/meraki/client";
import { summarizeDevices, summarizeLocations } from "@/lib/meraki/health";

export default async function OverviewPage() {
  const data = await getDashboardData();
  const summary = summarizeDevices(data.devices);
  const locations = summarizeLocations(data);
  const locationNames = new Map(data.locations.map((location) => [location.id, location.name]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Health across every Meraki network in your organization."
        fetchedAt={data.fetchedAt}
      />
      <StatCards locationCount={data.locations.length} counts={summary.counts} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <ProblemDevices
            devices={data.devices}
            locationNames={locationNames}
            fetchedAt={data.fetchedAt}
          />
          <DeviceTypeBreakdown byType={summary.byType} />
        </div>
        <LocationHealthList locations={locations} />
      </div>
    </div>
  );
}
