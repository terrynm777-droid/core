"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MeProfile = {
  id: string;
  username: string | null;
  bio: string | null;
  trader_style: string | null;
  avatar_url: string | null;
};

type Props = {
  onSaved?: () => void;
};

function clean(s: string) {
  const t = (s ?? "").trim();
  return t.length ? t : null;
}

function safeExtFromFileName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "png";
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ? ext : "png";
}

export default function ProfileEditor({ onSaved }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [traderStyle, setTraderStyle] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>("");

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load profile");

      const p: MeProfile | null = json?.profile ?? null;

      setUsername(p?.username ?? "");
      setBio(p?.bio ?? "");
      setTraderStyle(p?.trader_style ?? "");
      setAvatarUrl(p?.avatar_url ?? "");
      setPreviewUrl(p?.avatar_url ?? "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  useEffect(() => {
    if (file) return;
    setPreviewUrl(avatarUrl || "");
  }, [avatarUrl, file]);

  async function uploadAvatar(fileToUpload: File): Promise<string> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error("Not authenticated");

    const ext = safeExtFromFileName(fileToUpload.name);
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: true,
        contentType: fileToUpload.type || "image/png",
      });

    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = data?.publicUrl;
    if (!url) throw new Error("Upload succeeded but no public URL returned.");
    return url;
  }

  async function resolveAvatarUrl(): Promise<string | null> {
    if (file) return await uploadAvatar(file);
    return clean(avatarUrl);
  }

  async function save() {
    setErr(null);
    setOk(null);
    setSaving(true);

    try {
      const finalAvatarUrl = await resolveAvatarUrl();

      const payload = {
        username: clean(username),
        bio: clean(bio),
        trader_style: clean(traderStyle),
        avatar_url: finalAvatarUrl,
      };

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save profile");

      setOk("Saved.");
      setFile(null);

      await load();

      // force top-right avatar/menu to refresh
      router.refresh();

      onSaved?.();
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
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Profile picture</div>

          <div className="h-10 w-10 overflow-hidden rounded-full border border-[#D7E4DD] bg-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="avatar preview"
                className="h-full w-full object-cover"
                onError={() => setPreviewUrl("")}
              />
            ) : null}
          </div>
        </div>

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
          <div className="text-xs text-[#6B7A74]">Option 2: upload</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {file ? <div className="text-xs text-[#6B7A74]">Selected: {file.name}</div> : null}
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