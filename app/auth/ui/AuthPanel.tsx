"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthPanel({
  defaultMode,
  nextPath,
}: {
  defaultMode: Mode;
  nextPath: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sp = useSearchParams();
  const next = sp.get("next") ?? nextPath;

  async function authGoogle() {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
    if (error) setMsg(error.message);
    setLoading(false);
  }

  async function authEmail() {
    setLoading(true);
    setMsg(null);

    const redirectTo = `${location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    // LOGIN: magic link (OTP) — no password, just email.
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) setMsg(error.message);
      else setMsg("Check your email for a magic link to log in.");
      setLoading(false);
      return;
    }

    // SIGNUP: creates user (Supabase will send confirmation email if enabled)
    const { error } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(), // avoids building password UI for now
      options: { emailRedirectTo: redirectTo },
    });
    if (error) setMsg(error.message);
    else setMsg("Check your email to confirm your account, then you can enter.");
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      {/* Mode switch */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F7FAF8] p-2 border border-[#E5EFEA]">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            mode === "login"
              ? "bg-white border border-[#D7E4DD] shadow-sm"
              : "text-[#6B7A74]"
          }`}
        >
          Log in (Existing member)
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            mode === "signup"
              ? "bg-white border border-[#D7E4DD] shadow-sm"
              : "text-[#6B7A74]"
          }`}
        >
          Sign up (New member)
        </button>
      </div>

      <div className="mt-6">
        <div className="text-sm text-[#3E4C47]">
          {mode === "login"
            ? "Log in as a registered member."
            : "Create a new CORE account in 30 seconds."}
        </div>

        <button
          type="button"
          onClick={authGoogle}
          disabled={loading}
          className="mt-4 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm font-medium hover:shadow-sm disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5EFEA]" />
          <div className="text-xs text-[#6B7A74]">or</div>
          <div className="h-px flex-1 bg-[#E5EFEA]" />
        </div>

        <label className="text-xs text-[#6B7A74]">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE8CF]"
        />

        <button
          type="button"
          onClick={authEmail}
          disabled={loading || !email}
          className="mt-4 w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-sm font-medium text-white hover:brightness-95 disabled:opacity-60"
        >
          {mode === "login" ? "Send magic link" : "Create account"}
        </button>

        {msg ? (
          <div className="mt-4 text-sm text-[#6B7A74]">{msg}</div>
        ) : null}
      </div>
    </div>
  );
}