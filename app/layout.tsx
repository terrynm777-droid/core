import "./globals.css";
import type { Metadata } from "next";
import TopModuleHeader from "@/app/components/TopModuleHeader";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7FAF8] text-[#0B0F0E]">
        <TopModuleHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}