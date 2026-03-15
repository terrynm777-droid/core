"use client";

import Image from "next/image";
import Link from "next/link";
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

  const [quickAnswer, setQuickAnswer] = useState<number | null>(null);
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  const title = lang === "en" ? lesson.title : lesson.title_ja;
  const desc = lang === "en" ? lesson.desc : lesson.desc_ja;
  const body = lang === "en" ? lesson.body_en : lesson.body_ja;
  const example = lang === "en" ? lesson.example_en : lesson.example_ja;
  const mistake = lang === "en" ? lesson.mistake_en : lesson.mistake_ja;

  const quickQuestion =
    lang === "ja" && lesson.quickCheck.questionJa
      ? lesson.quickCheck.questionJa
      : lesson.quickCheck.question;

  const quickOptions =
    lang === "ja" && lesson.quickCheck.optionsJa?.length === lesson.quickCheck.options.length
      ? lesson.quickCheck.optionsJa
      : lesson.quickCheck.options;

  const quickExplanation =
    lang === "ja" && lesson.quickCheck.explanationJa
      ? lesson.quickCheck.explanationJa
      : lesson.quickCheck.explanation;

  const lessonIndex = level.lessons.findIndex((item) => item.slug === lesson.slug);
  const prevLesson = lessonIndex > 0 ? level.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < level.lessons.length - 1
      ? level.lessons[lessonIndex + 1]
      : null;

  const quickCorrect = quickSubmitted && quickAnswer === lesson.quickCheck.answerIndex;
  const canGoNext = completed || quickCorrect;

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
          {lang === "en" ? level.title : level.title_ja} / {title}
        </div>

        <div className="inline-flex rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-1">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              lang === "en"
                ? "border border-[#D7E4DD] bg-white text-[#0B0F0E]"
                : "text-[#6B7A74]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("ja")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              lang === "ja"
                ? "border border-[#D7E4DD] bg-white text-[#0B0F0E]"
                : "text-[#6B7A74]"
            }`}
          >
            日本語
          </button>
        </div>
      </div>

      <h1 className="mt-3 text-3xl font-semibold text-[#0B0F0E]">{title}</h1>
      <p className="mt-4 text-base leading-8 text-[#37413D]">{desc}</p>

            {!!lesson.visuals?.length && (
  <div className="mt-8 grid gap-5">
    {lesson.visuals.map((visual) => {
      const visualSrc = lang === "ja" && visual.srcJa ? visual.srcJa : visual.src;
      const visualAlt = lang === "ja" && visual.altJa ? visual.altJa : visual.alt;
      const visualCaption =
        lang === "ja" && visual.captionJa ? visual.captionJa : visual.caption;

      return (
        <div
          key={`${lesson.slug}-${visualSrc}`}
          className="overflow-hidden rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8]"
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={visualSrc}
              alt={visualAlt}
              fill
              className="object-cover"
            />
          </div>

          {visualCaption ? (
            <div className="px-4 py-3 text-sm text-[#37413D]">
              {visualCaption}
            </div>
          ) : null}
        </div>
      );
    })}
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
          <div className="text-sm font-semibold text-[#0B0F0E]">
            {lang === "en" ? "Example" : "例"}
          </div>
          <p className="mt-3 text-sm leading-7 text-[#37413D]">{example}</p>
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
          <div className="text-sm font-semibold text-[#0B0F0E]">
            {lang === "en" ? "Common mistake" : "よくある間違い"}
          </div>
          <p className="mt-3 text-sm leading-7 text-[#37413D]">{mistake}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
        <div className="text-sm font-semibold text-[#0B0F0E]">
          {lang === "en" ? "Quick check" : "クイックチェック"}
        </div>

        <p className="mt-3 text-sm leading-7 text-[#37413D]">{quickQuestion}</p>

        <div className="mt-4 space-y-2">
          {quickOptions.map((option, i) => {
            const selected = quickAnswer === i;
            const correct = lesson.quickCheck.answerIndex === i;
            const showCorrect = quickSubmitted && correct;
            const showWrong = quickSubmitted && selected && !correct;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!quickSubmitted) setQuickAnswer(i);
                }}
                className={[
                  "block w-full rounded-xl border px-4 py-3 text-left text-sm transition",
                  selected
                    ? "border-[#22C55E] bg-[#E9F9EF] text-[#0B0F0E]"
                    : "border-[#D7E4DD] bg-white text-[#0B0F0E]",
                  showCorrect ? "border-[#22C55E] bg-[#E9F9EF]" : "",
                  showWrong ? "border-red-300 bg-red-50" : "",
                ].join(" ")}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={quickAnswer === null || quickSubmitted}
            onClick={() => setQuickSubmitted(true)}
            className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {lang === "en" ? "Submit answer" : "回答を送信"}
          </button>

          {quickSubmitted ? (
            <button
              type="button"
              onClick={() => {
                setQuickSubmitted(false);
                setQuickAnswer(null);
              }}
              className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
            >
              {lang === "en" ? "Retry" : "やり直す"}
            </button>
          ) : null}
        </div>

        {quickSubmitted ? (
          <div className="mt-4 rounded-2xl border border-[#D7E4DD] bg-white p-4">
            <div className="text-sm font-semibold text-[#0B0F0E]">
              {quickCorrect
                ? lang === "en"
                  ? "Correct"
                  : "正解"
                : lang === "en"
                ? "Incorrect"
                : "不正解"}
            </div>
            <p className="mt-2 text-sm leading-7 text-[#37413D]">
              {quickExplanation}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
        <div className="text-sm text-[#37413D]">
          Educational content developed with AI-assisted drafting and human editorial review.
          For educational use only. Not financial advice.
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
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
          {completed
            ? lang === "en"
              ? "Completed"
              : "完了済み"
            : saving
            ? lang === "en"
              ? "Saving..."
              : "保存中..."
            : lang === "en"
            ? "Mark complete"
            : "完了にする"}
        </button>

        {prevLesson ? (
          <Link
            href={`/education/corelearn/${level.id}/${prevLesson.slug}`}
            className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
          >
            {lang === "en" ? "Previous lesson" : "前のレッスン"}
          </Link>
        ) : null}

        {nextLesson ? (
          <Link
            href={`/education/corelearn/${level.id}/${nextLesson.slug}`}
            className={[
              "inline-flex rounded-2xl px-4 py-2 text-sm font-medium",
              canGoNext
                ? "bg-[#22C55E] text-white hover:opacity-90"
                : "pointer-events-none cursor-not-allowed border border-[#D7E4DD] bg-white text-[#6B7A74]",
            ].join(" ")}
          >
            {lang === "en" ? "Next lesson" : "次のレッスン"}
          </Link>
        ) : (
          <Link
            href={`/education/corelearn/${level.id}/quiz`}
            className={[
              "inline-flex rounded-2xl px-4 py-2 text-sm font-medium",
              canGoNext
                ? "bg-[#22C55E] text-white hover:opacity-90"
                : "pointer-events-none cursor-not-allowed border border-[#D7E4DD] bg-white text-[#6B7A74]",
            ].join(" ")}
          >
            {lang === "en" ? "Go to level quiz" : "レベルクイズへ"}
          </Link>
        )}
      </div>
    </div>
  );
}