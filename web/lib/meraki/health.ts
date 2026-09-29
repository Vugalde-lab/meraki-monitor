import type {
  DashboardData,
  DeviceStatus,
  MerakiDevice,
  MerakiLocation,
  ProductType,
} from "./types";

export type HealthLevel = "healthy" | "degraded" | "critical" | "unknown";

export const DEVICE_STATUSES: DeviceStatus[] = [
  "online",
  "alerting",
  "offline",
  "dormant",
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  wireless: "Access point",
  switch: "Switch",
  appliance: "Security appliance",
  camera: "Camera",
  sensor: "Sensor",
  cellularGateway: "Cellular gateway",
  other: "Other",
};

export const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: "Online",
  alerting: "Alerting",
  offline: "Offline",
  dormant: "Dormant",
};

export const HEALTH_LABELS: Record<HealthLevel, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
  unknown: "No devices",
};

/** Hex values are needed for SVG map markers, which can't resolve CSS variables. */
export const HEALTH_COLORS: Record<HealthLevel, string> = {
  healthy: "#22c55e",
  degraded: "#f59e0b",
  critical: "#ef4444",
  unknown: "#64748b",
};

export type StatusCounts = Record<DeviceStatus, number> & { total: number };

export interface TypeCount {
  total: number;
  online: number;
}

export interface HealthSummary {
  counts: StatusCounts;
  byType: Partial<Record<ProductType, TypeCount>>;
  health: HealthLevel;
}

export interface LocationSummary extends HealthSummary {
  location: MerakiLocation;
}

const CRITICAL_OFFLINE_SHARE = 0.25;

export function summarizeDevices(devices: MerakiDevice[]): HealthSummary {
  const counts: StatusCounts = {
    online: 0,
    alerting: 0,
    offline: 0,
    dormant: 0,
    total: devices.length,
  };
  const byType: HealthSummary["byType"] = {};

  for (const device of devices) {
    counts[device.status] += 1;
    const entry = (byType[device.productType] ??= { total: 0, online: 0 });
    entry.total += 1;
    if (device.status === "online") entry.online += 1;
  }

  return { counts, byType, health: computeHealth(counts) };
}

function computeHealth(counts: StatusCounts): HealthLevel {
  const active = counts.total - counts.dormant;
  if (active === 0) return "unknown";
  if (counts.offline / active >= CRITICAL_OFFLINE_SHARE) return "critical";
  if (counts.offline > 0 || counts.alerting > 0) return "degraded";
  return "healthy";
}

const HEALTH_SEVERITY: Record<HealthLevel, number> = {
  critical: 0,
  degraded: 1,
  healthy: 2,
  unknown: 3,
};

export function summarizeLocations(data: DashboardData): LocationSummary[] {
  const devicesByNetwork = new Map<string, MerakiDevice[]>();
  for (const device of data.devices) {
    const list = devicesByNetwork.get(device.networkId) ?? [];
    list.push(device);
    devicesByNetwork.set(device.networkId, list);
  }

  return data.locations
    .map((location) => ({
      location,
      ...summarizeDevices(devicesByNetwork.get(location.id) ?? []),
    }))
    .sort(
      (a, b) =>
        HEALTH_SEVERITY[a.health] - HEALTH_SEVERITY[b.health] ||
        a.location.name.localeCompare(b.location.name),
    );
}
