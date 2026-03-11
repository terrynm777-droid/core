// app/auth/page.tsx
import { Suspense } from "react";
import AuthClient from "./ui/AuthClient";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  next?: string;
  mode?: "login" | "signup";
}>;

async function AuthPageInner({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  return (
    <AuthClient
      next={sp.next ?? "/feed"}
      mode={sp.mode === "signup" ? "signup" : "login"}
    />
  );
}

export default function AuthPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] flex items-center justify-center px-6">
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        </main>
      }
    >
      <AuthPageInner searchParams={searchParams} />
    </Suspense>
  );
}