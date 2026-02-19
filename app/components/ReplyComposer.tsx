"use client";

import { useState } from "react";

export default function ReplyComposer({
  placeholder,
  onSubmit,
}: {
  placeholder: string;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const v = text.trim();
    if (!v || busy) return;
    setBusy(true);
    try {
      await onSubmit(v);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[56px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-3 text-sm outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={busy || !text.trim()}
        className="h-[56px] rounded-2xl bg-[#22C55E] px-4 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "…" : "Send"}
      </button>
    </div>
  );
}