import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/lib/format";
import { PRODUCT_TYPE_LABELS } from "@/lib/meraki/health";
import type { MerakiDevice } from "@/lib/meraki/types";

interface DeviceTableProps {
  devices: MerakiDevice[];
  locationNames: Map<string, string>;
  fetchedAt: string;
}

export function DeviceTable({ devices, locationNames, fetchedAt }: DeviceTableProps) {
  if (devices.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted">
        No devices match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-surface-muted/50 text-xs text-muted">
          <tr>
            <th scope="col" className="px-5 py-2.5 font-medium">Name</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Type</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Model</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Serial</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Location</th>
            <th scope="col" className="px-3 py-2.5 font-medium">LAN IP</th>
            <th scope="col" className="px-5 py-2.5 text-right font-medium">Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {devices.map((device) => (
            <tr key={device.serial} className="hover:bg-surface-muted/40">
              <th scope="row" className="px-5 py-2.5 font-mono text-[13px] font-medium">
                {device.name}
              </th>
              <td className="px-3 py-2.5">
                <StatusBadge status={device.status} />
              </td>
              <td className="px-3 py-2.5 text-muted">{PRODUCT_TYPE_LABELS[device.productType]}</td>
              <td className="px-3 py-2.5">{device.model}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-muted">{device.serial}</td>
              <td className="px-3 py-2.5">{locationNames.get(device.networkId) ?? "—"}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-muted">{device.lanIp ?? "—"}</td>
              <td className="px-5 py-2.5 text-right text-muted tabular-nums">
                {formatRelative(device.lastReportedAt, fetchedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
