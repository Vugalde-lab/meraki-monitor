import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HealthBadge } from "@/components/status-badge";
import type { LocationSummary } from "@/lib/meraki/health";

export function LocationHealthList({ locations }: { locations: LocationSummary[] }) {
  return (
    <section
      aria-labelledby="location-health-heading"
      className="rounded-lg border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 id="location-health-heading" className="text-sm font-semibold">
          Location health
        </h2>
        <Link
          href="/map"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          View map
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {locations.map(({ location, counts, health }) => (
          <li key={location.id} className="flex items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{location.name}</p>
              <p className="truncate text-xs text-muted">
                {counts.online} online
                {counts.alerting > 0 && ` · ${counts.alerting} alerting`}
                {counts.offline > 0 && ` · ${counts.offline} offline`}
              </p>
            </div>
            <HealthBadge health={health} />
          </li>
        ))}
      </ul>
    </section>
  );
}
