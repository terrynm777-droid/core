"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type MeProfile = {
  id?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
};

export default function AvatarMenu({ me }: { me: MeProfile | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initial =
    (me?.username?.trim()?.[0] || "?").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-2xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:shadow-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="h-8 w-8 overflow-hidden rounded-full border border-[#D7E4DD] bg-[#F7FAF8] grid place-items-center">
          {me?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={me.avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-[#6B7A74]">
              {initial}
            </span>
          )}
        </div>
        <span className="hidden sm:block text-[#0B0F0E]">
          @{me?.username || "me"}
        </span>
        <span className="text-[#6B7A74]">▾</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white shadow-sm"
        >
          <Link
            role="menuitem"
            href={me?.username ? `/u/${encodeURIComponent(me.username)}` : "/settings/profile"}
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            role="menuitem"
            href="/settings/profile"
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            onClick={() => setOpen(false)}
          >
            Edit profile
          </Link>

          <Link
            role="menuitem"
            href="/settings/portfolio"
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            onClick={() => setOpen(false)}
          >
            Edit portfolio
          </Link>

          <div className="h-px bg-[#D7E4DD]" />

          <Link
            role="menuitem"
            href="/auth/signout"
            className="block px-4 py-3 text-sm text-red-600 hover:bg-[#F7FAF8]"
            onClick={() => setOpen(false)}
          >
            Sign out
          </Link>
        </div>
      ) : null}
    </div>
  );
}