import {
  HEALTH_LABELS,
  STATUS_LABELS,
  type HealthLevel,
} from "@/lib/meraki/health";
import type { DeviceStatus } from "@/lib/meraki/types";

const STATUS_STYLES: Record<DeviceStatus, string> = {
  online: "bg-success/10 text-success ring-success/25",
  alerting: "bg-warning/10 text-warning ring-warning/25",
  offline: "bg-danger/10 text-danger ring-danger/25",
  dormant: "bg-neutral/15 text-muted ring-neutral/30",
};

const STATUS_DOT: Record<DeviceStatus, string> = {
  online: "bg-success",
  alerting: "bg-warning",
  offline: "bg-danger",
  dormant: "bg-neutral",
};

const HEALTH_TO_STATUS: Record<HealthLevel, DeviceStatus> = {
  healthy: "online",
  degraded: "alerting",
  critical: "offline",
  unknown: "dormant",
};

function Badge({ tone, label }: { tone: DeviceStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${STATUS_STYLES[tone]}`}
    >
      <span className={`size-1.5 rounded-full ${STATUS_DOT[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return <Badge tone={status} label={STATUS_LABELS[status]} />;
}

export function HealthBadge({ health }: { health: HealthLevel }) {
  return <Badge tone={HEALTH_TO_STATUS[health]} label={HEALTH_LABELS[health]} />;
}
