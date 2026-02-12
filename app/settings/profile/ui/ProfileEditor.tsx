"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TraderStyle = "" | "day" | "short" | "mid" | "long";

export default function ProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [traderStyle, setTraderStyle] = useState<TraderStyle>("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);

      const res = await fetch("/api/profile", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(json?.error || "Failed to load profile");
        setLoading(false);
        return;
      }

      const p = json?.profile;
      setUsername(p?.username || "");
      setBio(p?.bio || "");
      setAvatarUrl(p?.avatar_url || "");
      setTraderStyle((p?.trader_style as TraderStyle) || "");
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

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        bio,
        avatar_url: avatarUrl,
        trader_style: traderStyle || null,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setErr(json?.error || "Save failed");
      setSaving(false);
      return;
    }

    setOk("Saved.");
    setSaving(false);

    // refresh server components that depend on profile
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