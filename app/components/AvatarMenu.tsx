"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = {
  avatarUrl?: string | null;
  username?: string | null;
};

export default function AvatarMenu({ avatarUrl, username }: Props) {
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

  const initials =
    (username?.trim()?.[0] || "U").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-2xl border border-[#D7E4DD] bg-white px-3 py-2 hover:shadow-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="h-8 w-8 overflow-hidden rounded-full border border-[#D7E4DD] bg-[#F7FAF8]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6B7A74]">
              {initials}
            </div>
          )}
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold leading-4 text-[#0B0F0E]">
            {username ? `@${username}` : "@unknown"}
          </div>
          <div className="text-xs text-[#6B7A74]">Menu</div>
        </div>

        <div className="text-xs text-[#6B7A74]">▾</div>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white shadow-sm"
          role="menu"
        >
          <Link
            href="/profile"
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/settings/profile"
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Edit profile
          </Link>

          <Link
            href="/settings/portfolio"
            className="block px-4 py-3 text-sm hover:bg-[#F7FAF8]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Edit portfolio
          </Link>

          <div className="h-px bg-[#D7E4DD]" />

          <Link
            href="/auth/signout"
            className="block px-4 py-3 text-sm text-red-600 hover:bg-[#F7FAF8]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Sign out
          </Link>
        </div>
      ) : null}
    </div>
  );
}