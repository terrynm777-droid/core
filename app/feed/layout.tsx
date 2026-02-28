// app/feed/layout.tsx
import { Suspense } from "react";
import FeedLayoutClient from "./FeedLayoutClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]" />}>
      <FeedLayoutClient>{children}</FeedLayoutClient>
    </Suspense>
  );
}