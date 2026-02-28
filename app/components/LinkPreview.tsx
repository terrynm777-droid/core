"use client";

import { useEffect, useState } from "react";

type Preview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

export default function LinkPreview({ url }: { url: string }) {
  const [p, setP] = useState<Preview | null>(null);

  useEffect(() => {
    if (!url) {
      setP(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!cancelled && res.ok) setP(json);
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!p?.url) return null;

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 block overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white hover:shadow-sm"
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt="" className="h-40 w-full object-cover" />
      ) : null}

      <div className="p-4">
        <div className="text-xs text-[#6B7A74]">{p.siteName || "Link"}</div>
        <div className="mt-1 text-sm font-semibold leading-snug">{p.title || p.url}</div>
        {p.description ? (
          <div className="mt-2 line-clamp-2 text-sm text-[#4B5B55]">{p.description}</div>
        ) : null}
      </div>
    </a>
  );
}