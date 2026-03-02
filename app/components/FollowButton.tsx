"use client";

import { useEffect, useState } from "react";

export default function FollowButton({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [amIFollowing, setAmIFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/follows?userId=${encodeURIComponent(profileId)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) return;
      setFollowers(Number(json?.followersCount ?? 0));
      setFollowing(Number(json?.followingCount ?? 0));
      setAmIFollowing(Boolean(json?.amIFollowing));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);

    try {
      if (amIFollowing) {
        const res = await fetch(`/api/follows?followingId=${encodeURIComponent(profileId)}`, { method: "DELETE" });
        if (res.ok) setAmIFollowing(false);
      } else {
        const res = await fetch(`/api/follows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profileId }),
        });
        if (res.ok) setAmIFollowing(true);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-[#6B7A74]">
        {loading ? "…" : `${followers} followers • ${following} following`}
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={busy || loading}
        className={[
          "rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50",
          amIFollowing ? "border border-[#D7E4DD] bg-white" : "bg-[#22C55E] text-white",
        ].join(" ")}
      >
        {amIFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}