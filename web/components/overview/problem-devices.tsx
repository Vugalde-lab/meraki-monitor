import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/lib/format";
import { PRODUCT_TYPE_LABELS } from "@/lib/meraki/health";
import type { MerakiDevice } from "@/lib/meraki/types";

interface ProblemDevicesProps {
  devices: MerakiDevice[];
  locationNames: Map<string, string>;
  fetchedAt: string;
}

const MAX_ROWS = 8;

export function ProblemDevices({ devices, locationNames, fetchedAt }: ProblemDevicesProps) {
  const problems = devices
    .filter((device) => device.status === "offline" || device.status === "alerting")
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "offline" ? -1 : 1));

  return (
    <section
      aria-labelledby="problem-devices-heading"
      className="rounded-lg border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 id="problem-devices-heading" className="text-sm font-semibold">
          Devices needing attention
          <span className="ml-2 font-normal text-muted tabular-nums">{problems.length}</span>
        </h2>
        <Link
          href="/devices?status=offline"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          All devices
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
      {problems.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">All devices are online.</p>
      ) : (
        <ul className="divide-y divide-border">
          {problems.slice(0, MAX_ROWS).map((device) => (
            <li key={device.serial} className="flex items-center gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm">{device.name}</p>
                <p className="truncate text-xs text-muted">
                  {PRODUCT_TYPE_LABELS[device.productType]} ·{" "}
                  {locationNames.get(device.networkId) ?? "Unknown location"} · seen{" "}
                  {formatRelative(device.lastReportedAt, fetchedAt).toLowerCase()}
                </p>
              </div>
              <StatusBadge status={device.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
