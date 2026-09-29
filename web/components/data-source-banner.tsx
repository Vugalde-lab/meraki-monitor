import { FlaskConical } from "lucide-react";
import type { DataSource } from "@/lib/meraki/types";

interface DataSourceBannerProps {
  source: DataSource;
  notice: string | null;
}

export function DataSourceBanner({ source, notice }: DataSourceBannerProps) {
  if (source === "live") return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-sm sm:px-6 lg:px-8"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="text-pretty text-foreground">
        <span className="font-semibold text-warning">Sample data.</span>{" "}
        {notice ??
          "The Meraki API isn't connected yet. Add MERAKI_API_KEY and MERAKI_ORG_ID as server environment variables to see live devices."}
      </p>
    </div>
  );
}
