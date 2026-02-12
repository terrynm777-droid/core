// app/u/[username]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();

  const username = decodeURIComponent(params.username);

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, trader_style, created_at")
    .eq("username", username)
    .maybeSingle();

  if (profileErr) throw profileErr;
  if (!profile) return notFound();

  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (postsErr) throw postsErr;

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white">
              <Image
                src={profile.avatar_url || "/brand/core-mark.png"}
                alt={profile.username || "avatar"}
                width={64}
                height={64}
              />
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {profile.username || "Unnamed"}
              </div>
              <div className="mt-1 text-sm text-[#6B7A74]">
                {profile.trader_style ? `Style: ${profile.trader_style}` : "Style: —"}
              </div>
            </div>
          </div>

          <Link
            href="/feed"
            className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm hover:shadow-sm"
          >
            Back to feed
          </Link>
        </div>

        {profile.bio ? (
          <div className="mt-5 rounded-2xl border border-[#D7E4DD] bg-white p-4">
            <div className="text-sm font-semibold">Bio</div>
            <p className="mt-2 text-sm text-[#3E4C47] whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#6B7A74]">
            No bio yet.
          </div>
        )}

        <div className="mt-8">
          <div className="text-sm font-semibold">Posts</div>
          <div className="mt-3 space-y-3">
            {posts?.length ? (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[#D7E4DD] bg-white p-4"
                >
                  <div className="text-xs text-[#6B7A74]">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm whitespace-pre-wrap">
                    {p.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#6B7A74]">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}