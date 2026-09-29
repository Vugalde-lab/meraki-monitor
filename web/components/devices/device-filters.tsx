import Link from "next/link";

export interface DeviceFilterState {
  status?: string;
  type?: string;
  location?: string;
}

interface FilterOption {
  value: string | undefined;
  label: string;
  count: number;
}

interface FilterGroupProps {
  label: string;
  param: keyof DeviceFilterState;
  options: FilterOption[];
  current: DeviceFilterState;
}

function buildHref(current: DeviceFilterState, param: keyof DeviceFilterState, value?: string) {
  const params = new URLSearchParams();
  const next = { ...current, [param]: value };
  for (const [key, val] of Object.entries(next)) {
    if (val) params.set(key, val);
  }
  const query = params.toString();
  return query ? `/devices?${query}` : "/devices";
}

export function FilterGroup({ label, param, options, current }: FilterGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-muted">{label}</span>
      {options.map((option) => {
        const isActive = current[param] === option.value;
        return (
          <Link
            key={option.label}
            href={buildHref(current, param, option.value)}
            aria-current={isActive ? "true" : undefined}
            scroll={false}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            {option.label}
            <span className="ml-1 tabular-nums opacity-70">{option.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
