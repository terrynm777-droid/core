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
  const trimmed = text.trim();

  async function handleSubmit() {
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSubmit(trimmed);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[56px] w-full resize-none rounded-xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!trimmed || busy}
        className="rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Saving…" : "Send"}
      </button>
    </div>
  );
}