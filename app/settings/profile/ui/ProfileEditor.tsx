"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MeProfile = {
  id: string;
  username: string | null;
  bio: string | null;
  trader_style: string | null;
  avatar_url: string | null;
};

export default function ProfileEditor() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [traderStyle, setTraderStyle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load");

      const p: MeProfile | null = json?.profile ?? null;
      setUsername(p?.username ?? "");
      setBio(p?.bio ?? "");
      setTraderStyle(p?.trader_style ?? "");
      setAvatarUrl(p?.avatar_url ?? "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadAvatarIfNeeded(): Promise<string | null> {
    if (!file) return avatarUrl.trim() ? avatarUrl.trim() : null;

    // Upload to Supabase Storage bucket `avatars`
    // You must create the bucket in Supabase dashboard (public).
    const ext = file.name.split(".").pop() || "png";
    const filePath = `avatars/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/png",
      });

    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl || null;
  }

  async function save() {
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      const finalAvatar = await uploadAvatarIfNeeded();

      // IMPORTANT: Partial save allowed.
      // Only send what the user typed. No required fields.
      const payload = {
        username: username.trim() || null,
        bio: bio.trim() || null,
        trader_style: traderStyle.trim() || null,
        avatar_url: finalAvatar,
      };

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save");

      setOk("Saved.");
      setFile(null);
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-semibold">Username</div>
        <input
          className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="terry_trades1"
        />
        <div className="text-xs text-[#6B7A74]">
          You can leave blank and set later.
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Trader style</div>
        <input
          className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={traderStyle}
          onChange={(e) => setTraderStyle(e.target.value)}
          placeholder="Momentum / Macro / Long-term"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Bio</div>
        <textarea
          className="w-full min-h-[96px] rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio (optional)"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
        <div className="text-sm font-semibold">Profile picture</div>

        <div className="space-y-2">
          <div className="text-xs text-[#6B7A74]">Option 1: paste image URL</div>
          <input
            className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs text-[#6B7A74]">
            Option 2: upload from computer
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {file ? (
            <div className="text-xs text-[#6B7A74]">
              Selected: {file.name}
            </div>
          ) : null}
        </div>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
      {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}