import { HEALTH_COLORS, HEALTH_LABELS, type HealthLevel } from "@/lib/meraki/health";

const LEVELS: HealthLevel[] = ["healthy", "degraded", "critical", "unknown"];

export function MapLegend({ counts }: { counts: Record<HealthLevel, number> }) {
  return (
    <ul aria-label="Marker legend" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {LEVELS.map((level) => (
        <li key={level} className="flex items-center gap-1.5 text-muted">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: HEALTH_COLORS[level] }}
            aria-hidden="true"
          />
          {HEALTH_LABELS[level]}
          <span className="text-foreground tabular-nums">{counts[level]}</span>
        </li>
      ))}
    </ul>
  );
}
