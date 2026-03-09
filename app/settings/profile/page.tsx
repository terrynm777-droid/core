import { Suspense } from "react";
import ProfilePageInner from "./ProfilePageInner";

export const dynamic = "force-dynamic";

export default function ProfileSettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
              <div className="text-sm text-[#6B7A74]">Loading…</div>
            </div>
          </div>
        </main>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}