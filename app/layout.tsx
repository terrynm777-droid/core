import "./globals.css";
import type { Metadata } from "next";
import CoreLogo from "@/app/components/CoreLogo";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
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