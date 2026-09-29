export type DeviceStatus = "online" | "alerting" | "offline" | "dormant";

export type ProductType =
  | "wireless"
  | "switch"
  | "appliance"
  | "camera"
  | "sensor"
  | "cellularGateway"
  | "other";

export interface MerakiDevice {
  serial: string;
  name: string;
  model: string;
  productType: ProductType;
  status: DeviceStatus;
  networkId: string;
  lanIp: string | null;
  lastReportedAt: string | null;
}

export interface MerakiLocation {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

export type DataSource = "live" | "sample";

export interface DashboardData {
  source: DataSource;
  notice: string | null;
  fetchedAt: string;
  locations: MerakiLocation[];
  devices: MerakiDevice[];
}
