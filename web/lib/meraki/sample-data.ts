import type {
  DashboardData,
  DeviceStatus,
  MerakiDevice,
  MerakiLocation,
  ProductType,
} from "./types";

type DeviceMix = Partial<Record<ProductType, number>>;

interface SampleSite extends MerakiLocation {
  code: string;
  mix: DeviceMix;
  /** Keys are `${productType}-${index}` (1-based) for devices that aren't online. */
  issues?: Record<string, DeviceStatus>;
}

const MODELS: Record<ProductType, string> = {
  wireless: "MR46",
  switch: "MS250-48FP",
  appliance: "MX85",
  camera: "MV63",
  sensor: "MT11",
  cellularGateway: "MG41",
  other: "Z4",
};

const NAME_PREFIX: Record<ProductType, string> = {
  wireless: "AP",
  switch: "SW",
  appliance: "MX",
  camera: "CAM",
  sensor: "SNS",
  cellularGateway: "MG",
  other: "DEV",
};

const SAMPLE_SITES: SampleSite[] = [
  {
    id: "N_SAMPLE_SFO",
    code: "SFO",
    name: "San Francisco HQ",
    address: "500 Terry A Francois Blvd, San Francisco, CA",
    lat: 37.7706,
    lng: -122.3875,
    mix: { appliance: 2, switch: 6, wireless: 18, camera: 8, sensor: 4 },
    issues: { "wireless-7": "alerting", "camera-3": "offline" },
  },
  {
    id: "N_SAMPLE_SEA",
    code: "SEA",
    name: "Seattle Office",
    address: "1201 2nd Ave, Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    mix: { appliance: 1, switch: 3, wireless: 10, camera: 4 },
  },
  {
    id: "N_SAMPLE_DEN",
    code: "DEN",
    name: "Denver Warehouse",
    address: "4700 Holly St, Denver, CO",
    lat: 39.7817,
    lng: -104.9403,
    mix: { appliance: 1, switch: 2, wireless: 8, camera: 10, cellularGateway: 1 },
    issues: {
      "wireless-2": "offline",
      "wireless-3": "offline",
      "switch-2": "offline",
      "camera-5": "offline",
      "camera-6": "alerting",
    },
  },
  {
    id: "N_SAMPLE_AUS",
    code: "AUS",
    name: "Austin Branch",
    address: "600 Congress Ave, Austin, TX",
    lat: 30.2686,
    lng: -97.7426,
    mix: { appliance: 1, switch: 2, wireless: 7, camera: 3 },
    issues: { "wireless-5": "dormant" },
  },
  {
    id: "N_SAMPLE_CHI",
    code: "CHI",
    name: "Chicago Office",
    address: "233 S Wacker Dr, Chicago, IL",
    lat: 41.8789,
    lng: -87.6359,
    mix: { appliance: 2, switch: 4, wireless: 14, camera: 6, sensor: 2 },
    issues: { "switch-3": "alerting", "wireless-11": "alerting" },
  },
  {
    id: "N_SAMPLE_ATL",
    code: "ATL",
    name: "Atlanta Retail Store",
    address: "3393 Peachtree Rd NE, Atlanta, GA",
    lat: 33.8481,
    lng: -84.3624,
    mix: { appliance: 1, switch: 1, wireless: 4, camera: 4 },
    issues: {
      "appliance-1": "offline",
      "switch-1": "offline",
      "wireless-1": "offline",
      "wireless-2": "offline",
    },
  },
  {
    id: "N_SAMPLE_NYC",
    code: "NYC",
    name: "New York Office",
    address: "11 Times Square, New York, NY",
    lat: 40.7567,
    lng: -73.9888,
    mix: { appliance: 2, switch: 5, wireless: 16, camera: 5 },
  },
  {
    id: "N_SAMPLE_BOS",
    code: "BOS",
    name: "Boston Lab",
    address: "1 Kendall Sq, Cambridge, MA",
    lat: 42.3662,
    lng: -71.0907,
    mix: { appliance: 1, switch: 2, wireless: 6, sensor: 6 },
    issues: { "sensor-4": "alerting" },
  },
];

const HOUR = 60 * 60 * 1000;

function buildSampleDevices(site: SampleSite, siteIndex: number, now: number) {
  const devices: MerakiDevice[] = [];
  let typeIndex = 0;

  for (const [type, count = 0] of Object.entries(site.mix) as [ProductType, number][]) {
    typeIndex += 1;
    for (let n = 1; n <= count; n += 1) {
      const status = site.issues?.[`${type}-${n}`] ?? "online";
      const serialSuffix = `${site.code}${typeIndex}${String(n).padStart(2, "0")}`;
      const minutesAgo = status === "online" || status === "alerting" ? n % 5 : 0;
      const hoursAgo =
        status === "offline" ? 2 + ((n * 3) % 20) : status === "dormant" ? 24 * 9 : 0;

      devices.push({
        serial: `Q2SM-${serialSuffix.slice(0, 4)}-${serialSuffix.slice(4).padEnd(4, "0")}`,
        name: `${site.code}-${NAME_PREFIX[type]}-${String(n).padStart(2, "0")}`,
        model: MODELS[type],
        productType: type,
        status,
        networkId: site.id,
        lanIp: `10.${siteIndex + 10}.${typeIndex}.${n + 10}`,
        lastReportedAt: new Date(now - hoursAgo * HOUR - minutesAgo * 60_000).toISOString(),
      });
    }
  }

  return devices;
}

export function getSampleData(notice: string | null = null): DashboardData {
  const now = Date.now();
  const locations: MerakiLocation[] = SAMPLE_SITES.map(
    ({ id, name, address, lat, lng }) => ({ id, name, address, lat, lng }),
  );
  const devices = SAMPLE_SITES.flatMap((site, index) =>
    buildSampleDevices(site, index, now),
  );

  return {
    source: "sample",
    notice,
    fetchedAt: new Date(now).toISOString(),
    locations,
    devices,
  };
}
