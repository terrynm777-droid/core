"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function safeNext(next: string) {
  try {
    const decoded = decodeURIComponent(next || "");
    if (!decoded.startsWith("/")) return "/feed";
    if (decoded === "/") return "/feed";
    return decoded;
  } catch {
    return "/feed";
  }
}

type Mode = "login" | "signup";

type MeProfile = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  traderStyle: string | null;
  portfolio: any[] | null;
  portfolioPublic: boolean | null;
};

async function postAuthRedirect(nextSafe: string) {
  // Force profile setup if username missing
  try {
    const res = await fetch("/api/profile/me", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      const profile: MeProfile | null = data?.profile ?? null;
      if (!profile?.username) {
        window.location.href = "/settings/profile";
        return;
      }
    }
  } catch {
    // ignore; fall through
  }

  window.location.href = nextSafe;
}

export default function AuthClient({ next, mode }: { next: string; mode: Mode }) {
  const sp = useSearchParams();
  const nextSafe = useMemo(() => safeNext(next || "/feed"), [next]);
  const nextEncoded = useMemo(() => encodeURIComponent(nextSafe), [nextSafe]);

  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<Mode>(() => {
    const m = (sp.get("mode") as Mode | null) ?? mode;
    return m === "signup" ? "signup" : "login";
  });

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "login" | "signup" | "magic" | null>(null);

  function redirectToCallback() {
    return `${window.location.origin}/auth/callback?next=${nextEncoded}`;
  }

  async function signInWithGoogle() {
    setErr(null);
    setMsg(null);
    setLoading("google");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectToCallback() },
    });

    setLoading(null);
    if (error) setErr(error.message);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading("login");

    const clean = email.trim();
    if (!clean) {
      setLoading(null);
      setErr("Enter your email.");
      return;
    }
    if (!pw) {
      setLoading(null);
      setErr("Enter your password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: clean,
      password: pw,
    });

    setLoading(null);
    if (error) {
      setErr(error.message);
      return;
    }

    await postAuthRedirect(nextSafe);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading("signup");

    const clean = email.trim();
    if (!clean) {
      setLoading(null);
      setErr("Enter your email.");
      return;
    }
    if (!pw || pw.length < 8) {
      setLoading(null);
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (pw !== pw2) {
      setLoading(null);
      setErr("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: clean,
      password: pw,
      options: { emailRedirectTo: redirectToCallback() },
    });

    setLoading(null);

    if (error) {
      setErr(error.message);
      return;
    }

    // If email confirmation is ON, user won't have a session yet.
    if (!data.session) {
      setMsg("Account created. Check your email to confirm, then log in.");
      return;
    }

    await postAuthRedirect(nextSafe);
  }

  async function sendMagicLink(e?: React.FormEvent) {
    if (e) e.preventDefault();

    setErr(null);
    setMsg(null);
    setLoading("magic");

    const clean = email.trim();
    if (!clean) {
      setLoading(null);
      setErr("Enter your email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: redirectToCallback() },
    });

    setLoading(null);
    if (error) setErr(error.message);
    else setMsg("Magic link sent. Check your email.");
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#6B7A74]">CORE</div>
          <h1 className="mt-2 text-2xl font-semibold">{tab === "login" ? "Log in" : "Create account"}</h1>
          <p className="mt-2 text-sm text-[#6B7A74]">
            {tab === "login" ? "Log in as a registered member." : "New here? Create an account in under a minute."}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErr(null);
              setMsg(null);
            }}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium ${
              tab === "login" ? "border-[#0B0F0E] bg-white" : "border-[#D7E4DD] bg-[#F7FAF8] hover:bg-white"
            }`}
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErr(null);
              setMsg(null);
            }}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium ${
              tab === "signup" ? "border-[#0B0F0E] bg-white" : "border-[#D7E4DD] bg-[#F7FAF8] hover:bg-white"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={loading !== null}
          className="w-full rounded-2xl border border-[#D7E4DD] bg-white py-3 font-medium hover:bg-[#F3F7F5] disabled:opacity-60"
        >
          {loading === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <div className="my-6 text-center text-sm text-[#6B7A74]">or</div>

        {/* Password form */}
        {tab === "login" ? (
          <form onSubmit={onLogin} className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
              autoComplete="email"
            />
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
              autoComplete="current-password"
            />

            <button
              disabled={loading !== null}
              className="w-full rounded-2xl bg-[#0B0F0E] hover:brightness-95 text-white py-3 font-medium disabled:opacity-60"
            >
              {loading === "login" ? "Logging in…" : "Log in"}
            </button>

            <button
              type="button"
              onClick={() => sendMagicLink()}
              disabled={loading !== null}
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white py-3 text-sm font-medium hover:bg-[#F3F7F5] disabled:opacity-60"
            >
              {loading === "magic" ? "Sending…" : "Use magic link instead"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSignup} className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
              autoComplete="email"
            />
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password (8+ characters)"
              type="password"
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
              autoComplete="new-password"
            />
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Confirm password"
              type="password"
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white p-3 outline-none focus:border-[#22C55E]"
              autoComplete="new-password"
            />

            <button
              disabled={loading !== null}
              className="w-full rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 font-medium disabled:opacity-60"
            >
              {loading === "signup" ? "Creating…" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => sendMagicLink()}
              disabled={loading !== null}
              className="w-full rounded-2xl border border-[#D7E4DD] bg-white py-3 text-sm font-medium hover:bg-[#F3F7F5] disabled:opacity-60"
            >
              {loading === "magic" ? "Sending…" : "Send magic link (optional)"}
            </button>
          </form>
        )}

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-[#4B5A55]">{msg}</p>}

        <div className="mt-6 text-xs text-[#6B7A74]">
          Redirect after auth: <span className="font-mono text-[#3E4C47]">{nextSafe}</span>
        </div>

        <div className="mt-6 text-xs text-[#6B7A74]">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}