import "server-only";

import { cache } from "react";
import { getSampleData } from "./sample-data";
import type {
  DashboardData,
  DeviceStatus,
  MerakiDevice,
  MerakiLocation,
  ProductType,
} from "./types";

const MERAKI_API_BASE = "https://api.meraki.com/api/v1";
const REVALIDATE_SECONDS = 60;
const MAX_PAGES = 25;

interface ApiNetwork {
  id: string;
  name: string;
}

interface ApiDevice {
  serial: string;
  name?: string | null;
  model: string;
  networkId?: string | null;
  productType?: string | null;
  lanIp?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface ApiDeviceStatus {
  serial: string;
  status?: string | null;
  lastReportedAt?: string | null;
  lanIp?: string | null;
}

class MerakiApiError extends Error {
  constructor(public status: number) {
    super(`Meraki API responded with ${status}`);
  }
}

function getCredentials() {
  const apiKey = process.env.MERAKI_API_KEY;
  const orgId = process.env.MERAKI_ORG_ID;
  return apiKey && orgId ? { apiKey, orgId } : null;
}

/** Only follow pagination links on Meraki hosts so the API key is never sent elsewhere. */
function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => /rel="?next"?/.test(part))
    ?.match(/<([^>]+)>/);
  if (!match) return null;

  try {
    const url = new URL(match[1]);
    const isMerakiHost =
      url.protocol === "https:" &&
      (url.hostname === "api.meraki.com" || url.hostname.endsWith(".meraki.com"));
    return isMerakiHost ? url.toString() : null;
  } catch {
    return null;
  }
}

async function merakiGetAll<T>(path: string, apiKey: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${MERAKI_API_BASE}${path}`;

  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const response: Response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) throw new MerakiApiError(response.status);

    results.push(...((await response.json()) as T[]));
    url = getNextPageUrl(response.headers.get("link"));
  }

  return results;
}

const KNOWN_PRODUCT_TYPES = new Set<ProductType>([
  "wireless",
  "switch",
  "appliance",
  "camera",
  "sensor",
  "cellularGateway",
]);

function toProductType(value: string | null | undefined): ProductType {
  return value && KNOWN_PRODUCT_TYPES.has(value as ProductType)
    ? (value as ProductType)
    : "other";
}

function toStatus(value: string | null | undefined): DeviceStatus {
  return value === "online" ||
    value === "alerting" ||
    value === "offline" ||
    value === "dormant"
    ? value
    : "offline";
}

function hasCoordinates(device: ApiDevice) {
  return (
    typeof device.lat === "number" &&
    typeof device.lng === "number" &&
    !(device.lat === 0 && device.lng === 0)
  );
}

function buildLocations(networks: ApiNetwork[], devices: ApiDevice[]): MerakiLocation[] {
  return networks.map((network) => {
    const placed = devices.filter(
      (device) => device.networkId === network.id && hasCoordinates(device),
    );
    const average = (key: "lat" | "lng") =>
      placed.length
        ? placed.reduce((sum, device) => sum + (device[key] as number), 0) / placed.length
        : null;

    return {
      id: network.id,
      name: network.name,
      address: placed.find((device) => device.address)?.address ?? null,
      lat: average("lat"),
      lng: average("lng"),
    };
  });
}

async function fetchLiveData(apiKey: string, orgId: string): Promise<DashboardData> {
  const org = encodeURIComponent(orgId);
  const [networks, devices, statuses] = await Promise.all([
    merakiGetAll<ApiNetwork>(`/organizations/${org}/networks?perPage=1000`, apiKey),
    merakiGetAll<ApiDevice>(`/organizations/${org}/devices?perPage=1000`, apiKey),
    merakiGetAll<ApiDeviceStatus>(
      `/organizations/${org}/devices/statuses?perPage=1000`,
      apiKey,
    ),
  ]);

  const statusBySerial = new Map(statuses.map((status) => [status.serial, status]));

  const mergedDevices: MerakiDevice[] = devices
    .filter((device) => device.networkId)
    .map((device) => {
      const status = statusBySerial.get(device.serial);
      return {
        serial: device.serial,
        name: device.name || device.serial,
        model: device.model,
        productType: toProductType(device.productType),
        status: toStatus(status?.status),
        networkId: device.networkId as string,
        lanIp: status?.lanIp ?? device.lanIp ?? null,
        lastReportedAt: status?.lastReportedAt ?? null,
      };
    });

  return {
    source: "live",
    notice: null,
    fetchedAt: new Date().toISOString(),
    locations: buildLocations(networks, devices),
    devices: mergedDevices,
  };
}

/**
 * Returns live Meraki data when MERAKI_API_KEY and MERAKI_ORG_ID are set,
 * otherwise clearly-labeled sample data. Runs on the server only.
 */
export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const credentials = getCredentials();
  if (!credentials) return getSampleData();

  try {
    return await fetchLiveData(credentials.apiKey, credentials.orgId);
  } catch (error) {
    const status = error instanceof MerakiApiError ? ` (HTTP ${error.status})` : "";
    console.error("Meraki API request failed", error);
    return getSampleData(
      `Couldn't load data from the Meraki API${status}. Showing sample data instead.`,
    );
  }
});
