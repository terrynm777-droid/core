import "./globals.css";
import type { Metadata } from "next";
import CoreLogo from "@/app/components/CoreLogo";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
  icons: {
    icon: [{ url: "/favicon-v2.ico", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon-v2.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CoreLogo />
        {children}
        <Analytics />
      </body>
    </html>
  );
}