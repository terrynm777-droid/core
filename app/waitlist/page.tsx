"use client";

import { useState } from "react";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      setMessage("You're in. We'll email you when access opens.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold mb-4">Join Core</h1>
      <p className="text-gray-400 mb-8 text-center">
        Early access for traders who value signal over noise.
      </p>

      <form onSubmit={onSubmit} className="w-full max-w-md">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-3 rounded bg-gray-900 border border-gray-700"
        />

        <button
          disabled={status === "loading"}
          className="w-full py-3 bg-white text-black rounded"
        >
          {status === "loading" ? "Submitting..." : "Request Access"}
        </button>

        {message && (
          <p className={`mt-4 ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="underline text-gray-400">
            Back home
          </Link>
        </div>
      </form>
    </main>
  );
}