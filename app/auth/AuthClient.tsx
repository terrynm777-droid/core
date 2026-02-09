"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export default function AuthClient({ next }: { next: string }) {
  const supabase = createClient();

  const safeNext = useMemo(() => {
    if (!next || !next.startsWith("/") || next === "/") return "/feed";
    return next;
  }, [next]);

  const nextEncoded = useMemo(() => encodeURIComponent(safeNext), [safeNext]);

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  async function signInWithGoogle() {
    setErr(null);
    setMsg(null);
    setLoading("google");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${SITE_URL}/auth/callback?next=${nextEncoded}`,
      },
    });

    setLoading(null);
    if (error) setErr(error.message);
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading("email");

    const clean = email.trim();
    if (!clean) {
      setLoading(null);
      setErr("Enter an email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback?next=${nextEncoded}`,
      },
    });

    setLoading(null);
    if (error) setErr(error.message);
    else setMsg("Magic link sent. Check your email and open the login link.");
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#6B7A74]">CORE</div>
          <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-[#6B7A74]">Signal over noise.</p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading !== null}
          className="w-full rounded-2xl border border-[#D7E4DD] bg-white py-3 font-medium hover:bg-[#F3F7F5] disabled:opacity-60"
        >
          {loading === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <div className="my-6 text-center text-sm text-[#6B7A74]">or</div>

        <form onSubmit={signInWithEmail} className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
          />

          <button
            disabled={loading !== null}
            className="w-full rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 font-medium disabled:opacity-60"
          >
            {loading === "email" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-[#4B5A55]">{msg}</p>}
      </div>
    </main>
  );
}