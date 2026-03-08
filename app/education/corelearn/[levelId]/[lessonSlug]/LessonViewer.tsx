"use client";

import Image from "next/image";
import { useState } from "react";
import type { LessonContent, LevelContent } from "../../content";

export default function LessonViewer({
  level,
  lesson,
  initialCompleted,
}: {
  level: LevelContent;
  lesson: LessonContent;
  initialCompleted: boolean;
}) {
  const [lang, setLang] = useState<"en" | "ja">("en");
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);

  const title = lang === "en" ? lesson.title : lesson.title_ja;
  const desc = lang === "en" ? lesson.desc : lesson.desc_ja;
  const body = lang === "en" ? lesson.body_en : lesson.body_ja;
  const example = lang === "en" ? lesson.example_en : lesson.example_ja;
  const mistake = lang === "en" ? lesson.mistake_en : lesson.mistake_ja;

  async function markComplete() {
    if (completed || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/education/lessons/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          levelId: level.id,
          lessonSlug: lesson.slug,
        }),
      });

      if (res.ok) {
        setCompleted(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#6B7A74]">
          {level.title} / {lesson.title}
        </div>

        <div className="inline-flex rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-1">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              lang === "en" ? "bg-white border border-[#D7E4DD]" : "text-[#6B7A74]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("ja")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              lang === "ja" ? "bg-white border border-[#D7E4DD]" : "text-[#6B7A74]"
            }`}
          >
            日本語
          </button>
        </div>
      </div>

      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-base leading-8 text-[#4B5B55]">{desc}</p>

      {!!lesson.visuals?.length && (
        <div className="mt-8 grid gap-5">
          {lesson.visuals.map((visual) => (
            <div
              key={visual.src}
              className="overflow-hidden rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8]"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={visual.src}
                  alt={visual.alt}
                  fill
                  className="object-cover"
                />
              </div>
              {visual.caption ? (
                <div className="px-4 py-3 text-sm text-[#4B5B55]">{visual.caption}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {body.map((p, i) => (
          <p key={i} className="text-sm leading-7 text-[#37413D]">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
          <div className="text-sm font-semibold">
            {lang === "en" ? "Example" : "例"}
          </div>
          <p className="mt-3 text-sm leading-7 text-[#4B5B55]">{example}</p>
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
          <div className="text-sm font-semibold">
            {lang === "en" ? "Common mistake" : "よくある間違い"}
          </div>
          <p className="mt-3 text-sm leading-7 text-[#4B5B55]">{mistake}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
        <div className="text-sm font-semibold">
          {lang === "en" ? "Quick check" : "クイックチェック"}
        </div>
        <p className="mt-3 text-sm leading-7 text-[#37413D]">
          {lesson.quickCheck.question}
        </p>
        <div className="mt-4 space-y-2">
          {lesson.quickCheck.options.map((option, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm text-[#0B0F0E]"
            >
              {String.fromCharCode(65 + i)}. {option}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
        <div className="text-sm text-[#4B5B55]">
          Educational content developed with AI-assisted drafting and human editorial review.
          For educational use only. Not financial advice.
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={markComplete}
          disabled={completed || saving}
          className={[
            "inline-flex rounded-2xl px-4 py-2 text-sm font-medium text-white",
            completed
              ? "bg-[#0B0F0E] opacity-80"
              : "bg-[#22C55E] hover:opacity-90",
          ].join(" ")}
        >
          {completed ? "Completed" : saving ? "Saving..." : "Mark complete"}
        </button>
      </div>
    </div>
  );
}