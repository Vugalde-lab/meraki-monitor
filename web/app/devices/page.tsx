import type { Metadata } from "next";
import Link from "next/link";
import { FilterGroup, type DeviceFilterState } from "@/components/devices/device-filters";
import { DeviceTable } from "@/components/devices/device-table";
import { LocationInventoryTable } from "@/components/devices/location-inventory-table";
import { PageHeader } from "@/components/page-header";
import { getDashboardData } from "@/lib/meraki/client";
import {
  DEVICE_STATUSES,
  PRODUCT_TYPE_LABELS,
  STATUS_LABELS,
  summarizeLocations,
} from "@/lib/meraki/health";
import type { DeviceStatus, ProductType } from "@/lib/meraki/types";

export const metadata: Metadata = { title: "Devices" };

const STATUS_SORT_ORDER: Record<DeviceStatus, number> = {
  offline: 0,
  alerting: 1,
  online: 2,
  dormant: 3,
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DevicesPage({ searchParams }: PageProps<"/devices">) {
  const [data, params] = await Promise.all([getDashboardData(), searchParams]);
  const locations = summarizeLocations(data);
  const locationNames = new Map(data.locations.map((location) => [location.id, location.name]));

  const statusParam = firstValue(params.status);
  const typeParam = firstValue(params.type);
  const locationParam = firstValue(params.location);

  const filters: DeviceFilterState = {
    status: DEVICE_STATUSES.find((status) => status === statusParam),
    type: typeParam && typeParam in PRODUCT_TYPE_LABELS ? typeParam : undefined,
    location: locationParam && locationNames.has(locationParam) ? locationParam : undefined,
  };

  const scoped = data.devices.filter(
    (device) => !filters.location || device.networkId === filters.location,
  );
  const filtered = scoped
    .filter(
      (device) =>
        (!filters.status || device.status === filters.status) &&
        (!filters.type || device.productType === filters.type),
    )
    .sort(
      (a, b) =>
        STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status] ||
        a.name.localeCompare(b.name),
    );
  const clearLocationParams = new URLSearchParams(
    Object.entries({ status: filters.status, type: filters.type }).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    ),
  ).toString();

  const presentTypes = [...new Set(scoped.map((device) => device.productType))] as ProductType[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Devices"
        description="Every Meraki device, grouped by location and listed individually."
        fetchedAt={data.fetchedAt}
      />

      <LocationInventoryTable locations={locations} />

      <section
        aria-labelledby="all-devices-heading"
        className="overflow-hidden rounded-lg border border-border bg-surface"
      >
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="all-devices-heading" className="text-sm font-semibold">
              {filters.location ? locationNames.get(filters.location) : "All devices"}
              <span className="ml-2 font-normal text-muted tabular-nums">{filtered.length}</span>
            </h2>
            {filters.location && (
              <Link
                href={clearLocationParams ? `/devices?${clearLocationParams}` : "/devices"}
                scroll={false}
                className="text-xs text-muted hover:text-foreground"
              >
                Show all locations
              </Link>
            )}
          </div>
          <FilterGroup
            label="Status"
            param="status"
            current={filters}
            options={[
              { value: undefined, label: "All", count: scoped.length },
              ...DEVICE_STATUSES.map((status) => ({
                value: status,
                label: STATUS_LABELS[status],
                count: scoped.filter((device) => device.status === status).length,
              })),
            ]}
          />
          <FilterGroup
            label="Type"
            param="type"
            current={filters}
            options={[
              { value: undefined, label: "All", count: scoped.length },
              ...presentTypes.map((type) => ({
                value: type,
                label: PRODUCT_TYPE_LABELS[type],
                count: scoped.filter((device) => device.productType === type).length,
              })),
            ]}
          />
        </div>
        <DeviceTable devices={filtered} locationNames={locationNames} fetchedAt={data.fetchedAt} />
      </section>
    </div>
  );
}
