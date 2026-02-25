import "./globals.css";
import type { Metadata } from "next";
import CoreLogo from "@/app/components/CoreLogo";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
  icons: {
    icon: [{ url: "/icon.png?v=1004", type: "image/png" }],
    apple: [{ url: "/icon.png?v=1004" }],
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