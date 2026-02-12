"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TraderStyle = "" | "day" | "short" | "mid" | "long";

type MeProfile = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  traderStyle: TraderStyle | null;
  portfolio: any[] | null;
  portfolioPublic: boolean | null;
};

export default function ProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [traderStyle, setTraderStyle] = useState<TraderStyle>("");
  const [portfolioPublic, setPortfolioPublic] = useState(true);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);

      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(json?.error || "Failed to load profile");
        setLoading(false);
        return;
      }

      const p: MeProfile | null = json?.profile ?? null;
      setUsername(p?.username ?? "");
      setBio(p?.bio ?? "");
      setAvatarUrl(p?.avatarUrl ?? "");
      setTraderStyle((p?.traderStyle as TraderStyle) ?? "");
      setPortfolioPublic(p?.portfolioPublic ?? true);

      setLoading(false);
    })();
  }, []);

  const canSave = useMemo(() => {
    const u = username.trim();
    if (!u) return false;
    if (u.length < 3) return false;
    if (u.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return false;
    return true;
  }, [username]);

  async function onSave() {
    setSaving(true);
    setErr(null);
    setOk(null);

    const payload = {
      username: username.trim(),
      bio,
      avatarUrl,
      traderStyle: traderStyle || null,
      portfolioPublic,
      // portfolio: null, // leave for later; we’ll add editor UI after step 6
    };

    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setErr(json?.error || "Save failed");
      setSaving(false);
      return;
    }

    setOk("Saved.");
    setSaving(false);

    router.refresh();
  }

  if (loading) {
    return <div className="text-sm text-[#6B7A74]">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold">Username</div>
        <div className="text-xs text-[#6B7A74]">
          3–20 chars. Letters, numbers, underscore only.
        </div>
        <input
          className="mt-2 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. terry_trades"
        />
      </div>

      <div>
        <div className="text-sm font-semibold">Bio</div>
        <textarea
          className="mt-2 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm min-h-[96px]"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What do you focus on? What do you avoid?"
        />
      </div>

      <div>
        <div className="text-sm font-semibold">Avatar URL</div>
        <input
          className="mt-2 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <div className="text-sm font-semibold">Trader style</div>
        <select
          className="mt-2 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={traderStyle}
          onChange={(e) => setTraderStyle(e.target.value as TraderStyle)}
        >
          <option value="">—</option>
          <option value="day">Day trader</option>
          <option value="short">Short-term</option>
          <option value="mid">Mid-term</option>
          <option value="long">Long-term</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#D7E4DD] bg-white px-3 py-3">
        <div>
          <div className="text-sm font-semibold">Portfolio visibility</div>
          <div className="text-xs text-[#6B7A74]">
            Public = others can see your portfolio on your profile page.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPortfolioPublic((v) => !v)}
          className={`rounded-xl px-3 py-2 text-sm font-medium border ${
            portfolioPublic
              ? "border-[#22C55E] bg-[#E9F9EF] text-[#166534]"
              : "border-[#D7E4DD] bg-white text-[#0B0F0E]"
          }`}
        >
          {portfolioPublic ? "Public" : "Private"}
        </button>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
      {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

      <button
        onClick={onSave}
        disabled={!canSave || saving}
        className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}