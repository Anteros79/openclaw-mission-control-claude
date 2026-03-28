import type { Metadata } from "next";
import { IBM_Plex_Sans, Oxanium } from "next/font/google";

import { MissionControlFrame } from "@/components/mission-control-frame";

import "./globals.css";

const displayFont = Oxanium({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "PhoenixClaw Mission Control",
  description: "Unified operator-grade command center for OpenClaw systems and missions.",
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/brand/favicon-256x256.png", sizes: "256x256", type: "image/png" }
    ],
    apple: [{ url: "/brand/favicon-180x180.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/brand/favicon-32x32.png" }]
  }
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
    <body className="font-[family-name:var(--font-body)] antialiased">
      <MissionControlFrame>{children}</MissionControlFrame>
    </body>
  </html>
);

export default RootLayout;
