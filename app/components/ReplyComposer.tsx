"use client";

import { useState } from "react";

export default function ReplyComposer({
  placeholder,
  onSubmit,
}: {
  placeholder: string;
  onSubmit: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const v = text.trim();
    if (!v || busy) return;

    setErr(null);
    setBusy(true);
    try {
      await onSubmit(v);
      setText(""); // IMPORTANT: clear after success
    } catch (e: any) {
      setErr(e?.message ?? "Failed to send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D7E4DD] bg-white p-3">
      <div className="flex items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-[#D7E4DD] px-4 text-sm outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !text.trim()}
          className="h-12 rounded-2xl bg-[#22C55E] px-5 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>

      {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
    </div>
  );
}