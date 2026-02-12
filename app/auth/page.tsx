// app/auth/page.tsx
import { Suspense } from "react";
import AuthClient from "./ui/AuthClient";

export const dynamic = "force-dynamic";

export default function AuthPage({
  searchParams,
}: {
  searchParams?: { next?: string; mode?: "login" | "signup" };
}) {
  const next = searchParams?.next ?? "/feed";
  const mode = searchParams?.mode ?? "login";

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] flex items-center justify-center px-6">
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        </main>
      }
    >
      <AuthClient next={next} mode={mode} />
    </Suspense>
  );
}