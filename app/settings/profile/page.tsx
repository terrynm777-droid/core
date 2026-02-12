// app/settings/profile/page.tsx
import Link from "next/link";
import ProfileEditor from "./ui/ProfileEditor";

export const dynamic = "force-dynamic";

export default function ProfileSettingsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold">Edit profile</div>
            <div className="mt-1 text-sm text-[#6B7A74]">
              Username, bio, avatar, trader style.
            </div>
          </div>
          <Link
            href="/feed"
            className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm hover:shadow-sm"
          >
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D7E4DD] bg-white p-5">
          <ProfileEditor />
        </div>
      </div>
    </main>
  );
}