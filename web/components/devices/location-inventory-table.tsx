import Link from "next/link";
import { HealthBadge } from "@/components/status-badge";
import type { LocationSummary, TypeCount } from "@/lib/meraki/health";
import type { ProductType } from "@/lib/meraki/types";

const COLUMNS: { type: ProductType; label: string }[] = [
  { type: "wireless", label: "Access Points" },
  { type: "switch", label: "Switches" },
  { type: "appliance", label: "Appliances" },
  { type: "camera", label: "Cameras" },
];

const OTHER_TYPES: ProductType[] = ["sensor", "cellularGateway", "other"];

function CountCell({ count }: { count?: TypeCount }) {
  if (!count || count.total === 0) return <span className="text-muted">—</span>;
  const down = count.total - count.online;
  return (
    <span className="tabular-nums">
      <span className={down > 0 ? "text-warning" : undefined}>{count.online}</span>
      <span className="text-muted">/{count.total}</span>
    </span>
  );
}

export function LocationInventoryTable({ locations }: { locations: LocationSummary[] }) {
  return (
    <section
      aria-labelledby="inventory-heading"
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 id="inventory-heading" className="text-sm font-semibold">
          Inventory by location
        </h2>
        <p className="mt-0.5 text-xs text-muted">Online / total devices of each type.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-muted/50 text-xs text-muted">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">Location</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Health</th>
              {COLUMNS.map(({ type, label }) => (
                <th key={type} scope="col" className="px-3 py-2.5 text-right font-medium">
                  {label}
                </th>
              ))}
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Other</th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {locations.map(({ location, counts, byType, health }) => {
              const other = OTHER_TYPES.reduce<TypeCount>(
                (acc, type) => ({
                  total: acc.total + (byType[type]?.total ?? 0),
                  online: acc.online + (byType[type]?.online ?? 0),
                }),
                { total: 0, online: 0 },
              );
              return (
                <tr key={location.id} className="hover:bg-surface-muted/40">
                  <th scope="row" className="px-5 py-3 font-medium">
                    <Link
                      href={`/devices?location=${encodeURIComponent(location.id)}`}
                      className="hover:underline"
                    >
                      {location.name}
                    </Link>
                  </th>
                  <td className="px-3 py-3">
                    <HealthBadge health={health} />
                  </td>
                  {COLUMNS.map(({ type }) => (
                    <td key={type} className="px-3 py-3 text-right">
                      <CountCell count={byType[type]} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right">
                    <CountCell count={other} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <CountCell count={{ total: counts.total, online: counts.online }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
