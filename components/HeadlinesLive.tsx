"use client";

import { useEffect, useState } from "react";

type Headline = {
  id: number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
};

export default function HeadlinesLive() {
  const [items, setItems] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/headlines", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setItems([]);
        setError(json?.error ?? `Request failed: ${res.status}`);
        return;
      }

      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E5EFEA] bg-white p-4 text-sm text-[#6B7A74]">
        Loading headlines…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#F3D6D6] bg-white p-4 text-sm">
        <div className="font-semibold text-[#B42318]">Headlines error</div>
        <div className="mt-1 text-[#6B7A74]">{error}</div>
        <div className="mt-2 text-xs text-[#6B7A74]">
          Open <span className="font-mono">/api/headlines</span> on your deployed
          site to see the raw error.
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-[#E5EFEA] bg-white p-4 text-sm text-[#6B7A74]">
        No headlines returned.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((h) => (
        <a
          key={h.id}
          href={h.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl border border-[#E5EFEA] bg-white p-4 hover:shadow-sm"
        >
          <div className="text-sm font-medium">{h.headline}</div>
          <div className="mt-1 text-xs text-[#6B7A74]">{h.source}</div>
        </a>
      ))}
    </div>
  );
}