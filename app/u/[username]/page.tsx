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

type SnapshotRow = {
  id: string;
  created_at: string;
  user_id: string;
  total_value: number | null;
  currency: string | null;
};

const PALETTE = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155", "#94A3B8"];

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function buildConicGradient(items: { label: string; value: number; color: string }[]) {
  const total = items.reduce((a, x) => a + x.value, 0);
  if (!total) return { gradient: "conic-gradient(#E6EEE9 0 100%)", rows: [] as any[] };

  let acc = 0;
  const stops: string[] = [];
  const rows = items
    .filter((x) => x.value > 0)
    .map((x) => {
      const pct = (x.value / total) * 100;
      const from = acc;
      const to = acc + pct;
      acc = to;
      stops.push(`${x.color} ${from.toFixed(3)}% ${to.toFixed(3)}%`);
      return { ...x, pct };
    });

  return { gradient: `conic-gradient(${stops.join(", ")})`, rows };
}

function buildLinePoints(values: number[], w: number, h: number, pad = 6) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function Shell({
  children,
  title = "Back to feed",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/feed"
          className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
        >
          {title}
        </Link>
        {children}
      </div>
    </main>
  );
}

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
      <Shell>
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Invalid profile</div>
          <div className="mt-1 text-sm text-[#6B7A74]">Missing username.</div>
        </div>
      </Shell>
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
      <Shell>
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Failed to load profile</div>
          <div className="mt-2 text-sm text-red-700">{profErr.message}</div>
        </div>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Profile not found</div>
          <div className="mt-1 text-sm text-[#6B7A74]">@{username}</div>
        </div>
      </Shell>
    );
  }

  const isOwner = !!user && user.id === profile.id;

  // Public portfolio
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

  // Snapshots (server) → collapse to latest per day
  const { data: snapRows } = await supabase
    .from("portfolio_snapshots")
    .select("id, created_at, user_id, total_value, currency")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(220);

  const byDay = new Map<string, number>();
  for (const r of (snapRows ?? []) as SnapshotRow[]) {
    const k = String(r.created_at).slice(0, 10);
    if (!byDay.has(k)) byDay.set(k, Number(r.total_value ?? 0));
  }

  // Build last 7 days series
  const today = new Date();
  const lineDays: string[] = [];
  const lineVals: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const k = dayKey(d);
    lineDays.push(k);
    lineVals.push(byDay.get(k) ?? 0);
  }

  // Force today to be live allocation so it updates immediately
  if (lineVals.length) lineVals[lineVals.length - 1] = totalAllocation;

  const safeUsername = profile.username ?? "unknown";
  const initial = (safeUsername[0] ?? "?").toUpperCase();

  // Pie
  const pieItems = holdings
    .map((h, i) => ({
      label: String(h.symbol || "").toUpperCase(),
      value: Number(h.amount) || 0,
      currency: h.currency || "—",
      color: PALETTE[i % PALETTE.length],
    }))
    .filter((x) => x.value > 0);

  const { gradient, rows: pieRows } = buildConicGradient(pieItems);

  // Line SVG + deltas
  const W = 520;
  const H = 110;
  const poly = buildLinePoints(lineVals, W, H, 8);

  const lastV = lineVals[lineVals.length - 1] ?? 0;
  const prevV = lineVals[lineVals.length - 2] ?? 0;
  const firstV = lineVals[0] ?? 0;

  const delta7Pct = firstV > 0 ? ((lastV - firstV) / firstV) * 100 : 0;
  const delta1Pct = prevV > 0 ? ((lastV - prevV) / prevV) * 100 : 0;

  const maxV = Math.max(...lineVals, 0);

  // Posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

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

        {/* Profile card */}
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

        {/* Portfolio */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Portfolio</div>

          {holdErr ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load portfolio: {holdErr.message}
            </div>
          ) : publicPortfolio ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                {/* Pie */}
                <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Allocation</div>
                    <div className="text-xs text-[#6B7A74]">{pieRows.length ? `${pieRows.length} holdings` : ""}</div>
                  </div>

                  <div className="mt-3 flex items-start gap-4">
                    <div
                      className="h-28 w-28 rounded-full border border-[#D7E4DD] bg-white"
                      style={{ backgroundImage: gradient }}
                      aria-label="Portfolio allocation pie"
                    />
                    <div className="flex-1 space-y-2">
                      {pieRows.length ? (
                        pieRows.slice(0, 6).map((r: any) => (
                          <div key={r.label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                              <span className="font-medium">{r.label}</span>
                            </div>
                            <span className="text-[#6B7A74]">{clamp(r.pct, 0, 100).toFixed(1)}%</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#6B7A74]">No holdings yet.</div>
                      )}
                      {pieRows.length > 6 ? (
                        <div className="text-[11px] text-[#6B7A74]">+ {pieRows.length - 6} more</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Line */}
                <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Last 7 days</div>
                    <div className="text-xs text-[#6B7A74]">
                      {maxV > 0 ? `${lastV.toLocaleString()}  (7D ${delta7Pct.toFixed(1)}% • 1D ${delta1Pct.toFixed(1)}%)` : "No snapshots yet"}
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white p-2">
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Portfolio value line chart">
                      <polyline
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={poly || ""}
                      />
                    </svg>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7A74]">
                    <span>{lineDays[0]}</span>
                    <span>{lineDays[lineDays.length - 1]}</span>
                  </div>
                </div>
              </div>

              {/* Holdings table */}
              {holdings.length ? (
                <div className="overflow-hidden rounded-2xl border border-[#D7E4DD]">
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
                <div className="text-sm text-[#6B7A74]">No holdings yet.</div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#6B7A74]">
              This user’s portfolio is private.
            </div>
          )}
        </div>

        {/* Posts */}
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