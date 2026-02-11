"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  headline: string;
  source: string;
  summary: string;
  url: string;
  datetime: number;
};

export default function HeadlinesLive() {
  const [items, setItems] = useState<Item[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        const r = await fetch("/api/headlines", { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load headlines");
        if (alive) setItems(j.items || []);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load headlines");
      }
    }

    load();
    const t = setInterval(load, 60_000); // refresh every 60s
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (err) {
    return (
      <div className="mt-3 rounded-2xl border border-[#E5EFEA] bg-white p-4 text-sm text-red-600">
        {err}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {items.map((x) => {
        const isOpen = openId === x.id;
        return (
          <div
            key={x.id}
            className="rounded-2xl border border-[#E5EFEA] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{x.headline}</div>

              <button
                type="button"
                className="text-xs text-[#6B7A74] hover:underline shrink-0"
                onClick={() => setOpenId(isOpen ? null : x.id)}
              >
                {isOpen ? "Hide" : "Details"}
              </button>
            </div>

            <div className="mt-1 text-xs text-[#6B7A74]">
              {x.source} •{" "}
              {x.datetime ? new Date(x.datetime * 1000).toLocaleString() : ""}
            </div>

            {isOpen && (
              <div className="mt-3">
                {x.summary && (
                  <div className="text-xs text-[#3E4C47] leading-relaxed">
                    {x.summary}
                  </div>
                )}

                <a
                  href={x.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-[#0B0F0E] underline"
                >
                  Open source →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}