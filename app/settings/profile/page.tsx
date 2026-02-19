"use client";

import { useRouter } from "next/navigation";
import ProfileEditor from "./ui/ProfileEditor";

export default function ProfileSettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md">
        {/* Top row: Back button like portfolio */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back
          </button>

          <a
            href="/settings/portfolio"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Edit portfolio
          </a>
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#6B7A74]">CORE</div>
          <h1 className="mt-2 text-2xl font-semibold">Set up your profile</h1>
          <p className="mt-2 text-sm text-[#6B7A74]">
            Choose a username. This is what shows on the feed.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
          <ProfileEditor
            onSaved={() => {
              router.push("/"); // feed
              router.refresh(); // force re-fetch server components
            }}
          />
        </div>
      </div>
    </main>
  );
}