"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LevelContent } from "../../content";

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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(initialScore);
  const [savedTotal, setSavedTotal] = useState<number | null>(initialTotal);
  const [savedPassed, setSavedPassed] = useState<boolean>(initialPassed);
  const [certificateCode, setCertificateCode] = useState<string | null>(initialCertificateCode);

  const score = useMemo(() => {
    return level.levelQuiz.reduce((acc, q, i) => {
      return acc + (answers[i] === q.answerIndex ? 1 : 0);
    }, 0);
  }, [answers, level]);

  const total = level.levelQuiz.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  async function submitQuiz() {
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

  const displayScore = submitted ? score : savedScore;
  const displayTotal = submitted ? total : savedTotal;
  const displayPct =
    displayScore !== null && displayTotal
      ? Math.round((displayScore / displayTotal) * 100)
      : null;

  return (
    <div className="mt-6 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">{level.title} — Mini Quiz</h1>
      <p className="mt-4 text-base leading-8 text-[#4B5B55]">
        Test your understanding before moving on.
      </p>

      <div className="mt-8 space-y-6">
        {level.levelQuiz.map((q, i) => (
          <div key={i} className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
            <div className="text-sm font-semibold">Question {i + 1}</div>
            <p className="mt-3 text-sm leading-7 text-[#37413D]">{q.question}</p>

            <div className="mt-4 space-y-2">
              {q.options.map((option, j) => {
                const checked = answers[i] === j;
                return (
                  <label
                    key={j}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm text-[#0B0F0E]"
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={checked}
                      onChange={() => setAnswers((prev) => ({ ...prev, [i]: j }))}
                    />
                    <span>
                      {String.fromCharCode(65 + j)}. {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={submitQuiz}
          disabled={saving}
          className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit quiz"}
        </button>
      </div>

      {displayScore !== null && displayTotal !== null && (
        <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#E9F9EF] p-5">
          <div className="text-lg font-semibold">
            Score: {displayScore} / {displayTotal}
          </div>
          <div className="mt-2 text-sm text-[#37413D]">
            {displayPct}% correct
          </div>
          <div className="mt-2 text-sm text-[#37413D]">
            {savedPassed ? "Passed" : "Not passed yet"}
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
      )}
    </div>
  );
}