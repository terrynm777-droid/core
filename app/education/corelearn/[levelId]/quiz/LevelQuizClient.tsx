"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LevelContent } from "../../content";

type Lang = "en" | "ja";

export default function LevelQuizClient({
  level,
  initialScore,
  initialTotal,
  initialPassed,
  initialCertificateCode,
}: {
  level: LevelContent;
  initialScore: number | null;
  initialTotal: number | null;
  initialPassed: boolean;
  initialCertificateCode: string | null;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(initialScore);
  const [savedTotal, setSavedTotal] = useState<number | null>(initialTotal);
  const [savedPassed, setSavedPassed] = useState<boolean>(initialPassed);
  const [certificateCode, setCertificateCode] = useState<string | null>(initialCertificateCode);

  const total = level.levelQuiz.length;

  const score = useMemo(() => {
    return level.levelQuiz.reduce((acc, q, i) => {
      return acc + (answers[i] === q.answerIndex ? 1 : 0);
    }, 0);
  }, [answers, level]);

  const allAnswered = useMemo(() => {
    return level.levelQuiz.every((_, i) => typeof answers[i] === "number");
  }, [answers, level]);

  const displayScore = submitted ? score : savedScore;
  const displayTotal = submitted ? total : savedTotal;
  const displayPct =
    displayScore !== null && displayTotal
      ? Math.round((displayScore / displayTotal) * 100)
      : null;

  async function submitQuiz() {
    if (!allAnswered) return;

    setSaving(true);
    try {
      const orderedAnswers = level.levelQuiz.map((_, i) =>
        typeof answers[i] === "number" ? answers[i] : -1
      );

      const res = await fetch("/api/education/levels/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          levelId: level.id,
          answers: orderedAnswers,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data) {
        setSavedScore(data.score ?? null);
        setSavedTotal(data.total ?? null);
        setSavedPassed(!!data.passed);
        setCertificateCode(data.certificateCode ?? null);
        setSubmitted(true);
      }
    } finally {
      setSaving(false);
    }
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    setSavedScore(null);
    setSavedTotal(null);
    setSavedPassed(false);
    setCertificateCode(null);
  }

  return (
    <div className="mt-6 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{level.title} — Mini Quiz</h1>
          <p className="mt-3 text-base leading-8 text-[#4B5B55]">
            Test your understanding before moving on.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium",
              lang === "en"
                ? "border-[#22C55E] bg-[#22C55E] text-white"
                : "border-[#D7E4DD] bg-white text-[#0B0F0E]",
            ].join(" ")}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("ja")}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium",
              lang === "ja"
                ? "border-[#22C55E] bg-[#22C55E] text-white"
                : "border-[#D7E4DD] bg-white text-[#0B0F0E]",
            ].join(" ")}
          >
            日本語
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {level.levelQuiz.map((q, i) => {
          const questionText = lang === "ja" && q.questionJa ? q.questionJa : q.question;
          const explanationText =
            lang === "ja" && q.explanationJa ? q.explanationJa : q.explanation;

          return (
            <div
              key={i}
              className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5"
            >
              <div className="text-sm font-semibold">Question {i + 1}</div>
              <p className="mt-3 text-sm leading-7 text-[#37413D]">{questionText}</p>

              <div className="mt-4 space-y-2">
                {q.options.map((option, j) => {
                  const optionText =
                    lang === "ja" && q.optionsJa?.[j] ? q.optionsJa[j] : option;

                  const selected = answers[i] === j;
                  const correct = q.answerIndex === j;

                  const showResult = submitted;
                  const isWrongPicked = showResult && selected && !correct;
                  const isCorrect = showResult && correct;

                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => {
                        if (!submitted) {
                          setAnswers((prev) => ({ ...prev, [i]: j }));
                        }
                      }}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                        isCorrect
                          ? "border-[#22C55E] bg-[#E9F9EF] text-[#0B0F0E]"
                          : isWrongPicked
                          ? "border-red-300 bg-red-50 text-[#0B0F0E]"
                          : selected
                          ? "border-[#22C55E] bg-[#22C55E] text-white"
                          : "border-[#D7E4DD] bg-white text-[#0B0F0E] hover:bg-[#F7FAF8]",
                      ].join(" ")}
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + j)}.</span>
                      <span>{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {submitted ? (
                <div className="mt-4 rounded-xl border border-[#D7E4DD] bg-white p-4 text-sm text-[#37413D]">
                  <div className="font-semibold text-[#0B0F0E]">
                    {answers[i] === q.answerIndex ? "Correct" : "Incorrect"}
                  </div>
                  <div className="mt-2">{explanationText}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submitQuiz}
          disabled={saving || submitted || !allAnswered}
          className="inline-flex rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Submit quiz"}
        </button>

        {submitted && !savedPassed ? (
          <button
            type="button"
            onClick={resetQuiz}
            className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-5 py-3 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
          >
            Retry
          </button>
        ) : null}
      </div>

      {displayScore !== null && displayTotal !== null ? (
        <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#E9F9EF] p-5">
          <div className="text-lg font-semibold">
            Score: {displayScore} / {displayTotal}
          </div>
          <div className="mt-2 text-sm text-[#37413D]">
            {displayPct}% correct
          </div>
          <div className="mt-2 text-sm text-[#37413D]">
            {savedPassed ? "Passed (80%+ reached)" : "Not passed yet (need 80%+)"}
          </div>

          {certificateCode ? (
            <div className="mt-4">
              <Link
                href={`/education/corelearn/${level.id}/certificate`}
                className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
              >
                View certificate
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}