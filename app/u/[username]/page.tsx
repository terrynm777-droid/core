import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type PublicPortfolioRow = {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
};

type HoldingRow = {
  id: string;
  symbol: string;
  amount: number;
  currency: string | null;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();

  const { username: raw } = await params;
  const username = decodeURIComponent(raw || "").trim();

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

  // Public portfolio (only if is_public=true)
  const { data: publicPortfolio } = await supabase
    .from("portfolios")
    .select("id, name, is_public, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .maybeSingle<PublicPortfolioRow>();

  const { data: publicHoldings, error: holdErr } = publicPortfolio?.id
    ? await supabase
        .from("portfolio_holdings")
        .select("id, symbol, amount, currency")
        .eq("portfolio_id", publicPortfolio.id)
        .order("symbol", { ascending: true })
    : { data: null, error: null };

  const holdings = (publicHoldings ?? []) as HoldingRow[];
  const totalAllocation = holdings.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);

  // Recent posts
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

        {/* ✅ Public portfolio section */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Portfolio</div>

          {holdErr ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load portfolio: {holdErr.message}
            </div>
          ) : publicPortfolio ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">{publicPortfolio.name || "Portfolio"}</div>
                  <div className="text-xs text-[#6B7A74]">Public</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#6B7A74]">Total allocation</div>
                  <div className="text-sm font-semibold">{totalAllocation.toLocaleString()}</div>
                </div>
              </div>

              {holdings.length ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#D7E4DD]">
                  <div className="grid grid-cols-3 bg-[#F7FAF8] px-4 py-2 text-xs font-semibold text-[#4B5B55]">
                    <div>Symbol</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Currency</div>
                  </div>

                  <div className="divide-y divide-[#E6EEE9]">
                    {holdings.map((h) => (
                      <div key={h.id} className="grid grid-cols-3 px-4 py-2 text-sm">
                        <div className="font-medium">{String(h.symbol || "").toUpperCase()}</div>
                        <div className="text-right">{Number(h.amount || 0).toLocaleString()}</div>
                        <div className="text-right text-[#6B7A74]">{h.currency || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-[#6B7A74]">No holdings yet.</div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#6B7A74]">
              This user’s portfolio is private.
            </div>
          )}
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