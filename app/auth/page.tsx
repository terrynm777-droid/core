"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/feed");
    router.refresh();
  }

  async function signIn() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/feed");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-2xl border border-[#D7E4DD] p-3 outline-none focus:ring-2 focus:ring-[#22C55E]"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-[#D7E4DD] p-3 outline-none focus:ring-2 focus:ring-[#22C55E]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err ? <div className="text-sm text-red-600">{err}</div> : null}

          <div className="flex gap-3">
            <button
              onClick={signIn}
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#22C55E] px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {loading ? "..." : "Sign in"}
            </button>
            <button
              onClick={signUp}
              disabled={loading}
              className="flex-1 rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 font-medium disabled:opacity-60"
            >
              {loading ? "..." : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}