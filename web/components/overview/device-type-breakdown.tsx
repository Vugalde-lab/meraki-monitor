import { formatPercent } from "@/lib/format";
import { PRODUCT_TYPE_LABELS, type HealthSummary } from "@/lib/meraki/health";
import type { ProductType } from "@/lib/meraki/types";

export function DeviceTypeBreakdown({ byType }: { byType: HealthSummary["byType"] }) {
  const rows = (Object.entries(byType) as [ProductType, { total: number; online: number }][])
    .sort(([, a], [, b]) => b.total - a.total);

  return (
    <section
      aria-labelledby="device-types-heading"
      className="rounded-lg border border-border bg-surface p-5"
    >
      <h2 id="device-types-heading" className="text-sm font-semibold">
        Online by device type
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        {rows.map(([type, { total, online }]) => {
          const share = total ? (online / total) * 100 : 0;
          return (
            <li key={type}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{PRODUCT_TYPE_LABELS[type]}s</span>
                <span className="text-muted tabular-nums">
                  {online}/{total}{" "}
                  <span className="text-foreground">{formatPercent(online, total)}</span>
                </span>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-label={`${PRODUCT_TYPE_LABELS[type]}s online`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(share)}
              >
                <div
                  className={`h-full rounded-full ${share >= 95 ? "bg-success" : share >= 75 ? "bg-warning" : "bg-danger"}`}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
