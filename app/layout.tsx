import "./globals.css";
import type { Metadata } from "next";
import CoreLogo from "@/app/components/CoreLogo";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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