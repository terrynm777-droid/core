import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  trader_style: string | null;
};

type PostRow = {
  id: string;
  content: string;
  created_at: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();

  // ✅ Next build expects params to be a Promise in your project
  const { username: raw } = await params;
  const username = decodeURIComponent(raw || "").trim();

  // Hard guard: /u/ with empty username
  if (!username) {
    return (
      <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Invalid profile</div>
            <div className="mt-1 text-sm text-[#6B7A74]">Missing username.</div>
          </div>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Fetch profile by username
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style")
    .eq("username", username)
    .maybeSingle<ProfileRow>();

  if (profErr) {
    return (
      <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Failed to load profile</div>
            <div className="mt-2 text-sm text-red-700">{profErr.message}</div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Profile not found</div>
            <div className="mt-1 text-sm text-[#6B7A74]">@{username}</div>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = !!user && user.id === profile.id;

  // ✅ Fetch recent posts by that user
  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (postsErr) {
    return (
      <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Failed to load posts</div>
            <div className="mt-2 text-sm text-red-700">{postsErr.message}</div>
          </div>
        </div>
      </main>
    );
  }

  const safeUsername = profile.username ?? "unknown";
  const initial = (safeUsername[0] ?? "?").toUpperCase();

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>

          {isOwner ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings/profile"
                className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
              >
                Edit profile
              </Link>
              <Link
                href="/settings/portfolio"
                className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
              >
                Edit portfolio
              </Link>
            </div>
          ) : (
            <div className="text-xs text-[#6B7A74]">Public profile</div>
          )}
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-[#D7E4DD] bg-[#F7FAF8] grid place-items-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm font-semibold text-[#6B7A74]">{initial}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="text-xl font-semibold">@{safeUsername}</div>
              <div className="mt-1 text-sm text-[#6B7A74]">{profile.trader_style || "—"}</div>

              {profile.bio ? (
                <div className="mt-3 whitespace-pre-wrap text-sm">{profile.bio}</div>
              ) : (
                <div className="mt-3 text-sm text-[#6B7A74]">No bio yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Recent posts</div>

          {posts && posts.length ? (
            (posts as PostRow[]).map((p) => (
              <div key={p.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm">
                <div className="text-xs text-[#6B7A74]">{new Date(p.created_at).toLocaleString()}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{p.content}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#6B7A74]">
              No posts yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}