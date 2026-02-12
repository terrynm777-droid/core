import Link from "next/link";
import ProfileEditor from "./ui/ProfileEditor";

export default function ProfileSettingsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#6B7A74]">CORE</div>
            <h1 className="mt-2 text-2xl font-semibold">Edit profile</h1>
            <p className="mt-2 text-sm text-[#6B7A74]">
              Username, bio, avatar, trader style.
            </p>
          </div>

          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back
          </Link>
        </div>

        <div className="flex justify-end">
          <Link
            href="/settings/portfolio"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Edit portfolio
          </Link>
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
          <ProfileEditor />
        </div>
      </div>
    </main>
  );
}