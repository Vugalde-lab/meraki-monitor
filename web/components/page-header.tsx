const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

interface PageHeaderProps {
  title: string;
  description: string;
  fetchedAt: string;
}

export function PageHeader({ title, description, fetchedAt }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <p className="text-xs text-muted">
        Updated <time dateTime={fetchedAt}>{timeFormatter.format(new Date(fetchedAt))}</time>
      </p>
    </div>
  );
}
