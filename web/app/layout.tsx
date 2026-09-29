import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getDashboardData } from "@/lib/meraki/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Meraki Monitor",
    template: "%s · Meraki Monitor",
  },
  description:
    "Monitor Cisco Meraki device health across every location: overview, device inventory, and a live site map.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const data = await getDashboardData();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <div className="flex min-h-dvh flex-col lg:flex-row">
          <AppNav />
          <div className="flex min-w-0 flex-1 flex-col">
            <DataSourceBanner source={data.source} notice={data.notice} />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
