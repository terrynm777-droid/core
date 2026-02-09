import { Suspense } from "react";
import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
          <div className="mx-auto max-w-md text-sm text-[#6B7A74]">Loading…</div>
        </main>
      }
    >
      <AuthClient />
    </Suspense>
  );
}