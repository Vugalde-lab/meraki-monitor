import { AlertTriangle, CheckCircle2, MapPin, Server, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatPercent } from "@/lib/format";
import type { StatusCounts } from "@/lib/meraki/health";

interface StatCardsProps {
  locationCount: number;
  counts: StatusCounts;
}

interface Stat {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
}

export function StatCards({ locationCount, counts }: StatCardsProps) {
  const stats: Stat[] = [
    {
      label: "Locations",
      value: String(locationCount),
      detail: "Meraki networks",
      icon: MapPin,
      tone: "text-muted",
    },
    {
      label: "Devices",
      value: String(counts.total),
      detail: `${counts.dormant} dormant`,
      icon: Server,
      tone: "text-muted",
    },
    {
      label: "Online",
      value: formatPercent(counts.online, counts.total - counts.dormant),
      detail: `${counts.online} of ${counts.total - counts.dormant} active`,
      icon: CheckCircle2,
      tone: "text-success",
    },
    {
      label: "Alerting",
      value: String(counts.alerting),
      detail: "Need attention",
      icon: AlertTriangle,
      tone: "text-warning",
    },
    {
      label: "Offline",
      value: String(counts.offline),
      detail: "Not reporting",
      icon: WifiOff,
      tone: "text-danger",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map(({ label, value, detail, icon: Icon, tone }) => (
        <li key={label} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{label}</p>
            <Icon className={`size-4 ${tone}`} aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted">{detail}</p>
        </li>
      ))}
    </ul>
  );
}
