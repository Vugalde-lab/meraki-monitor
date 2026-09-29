"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Map, Server } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Server },
  { href: "/map", label: "Map", icon: Map },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-4 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-6 lg:px-4 lg:py-6">
        <Link href="/" className="flex items-center gap-2.5 lg:px-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-success/15 text-success">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Meraki Monitor</span>
        </Link>

        <nav aria-label="Main" className="ml-auto lg:ml-0">
          <ul className="flex items-center gap-1 lg:flex-col lg:items-stretch">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-surface-muted font-medium text-foreground"
                        : "text-muted hover:bg-surface-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sr-only sm:hidden">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
