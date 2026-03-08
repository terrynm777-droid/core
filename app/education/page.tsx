import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Plan = {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  cta: string;
  href: string;
  locked?: boolean;
};

const plans: Plan[] = [
  {
    title: "CORELEARN",
    subtitle: "Free foundation",
    description:
      "Start from zero. Learn what stocks, markets, risk, news, and basic analysis actually mean in a clean step-by-step format.",
    bullets: [
      "Absolute beginner path",
      "English + 日本語",
      "Structured lessons",
      "Quiz-based progress",
    ],
    cta: "Start free",
    href: "/education/corelearn",
  },
  {
    title: "COREACADEMY",
    subtitle: "Advanced serious learning",
    description:
      "Professional-level education for serious traders and investors: strategies, frameworks, macro, risk, psychology, Python, and more.",
    bullets: [
      "Advanced strategy tracks",
      "Risk and portfolio frameworks",
      "Trading systems",
      "Python / algo later",
    ],
    cta: "Locked",
    href: "/education/coreacademy",
    locked: true,
  },
  {
    title: "CORETEST",
    subtitle: "Online assessment",
    description:
      "Online testing and certification to verify actual knowledge, not fake confidence.",
    bullets: [
      "Timed online exam",
      "Question banks",
      "Certificates later",
      "Skill validation",
    ],
    cta: "Locked",
    href: "/education/coretest",
    locked: true,
  },
  {
    title: "CORE検定",
    subtitle: "Paper-style examination",
    description:
      "Formal paper-style test track for deeper certified assessment.",
    bullets: [
      "Formal exam format",
      "Higher-stakes validation",
      "Certificate path",
      "Advanced assessment",
    ],
    cta: "Locked",
    href: "/education/kentei",
    locked: true,
  },
];

function PlanCard(plan: Plan) {
  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      <div>
        <div className="text-xl font-semibold">{plan.title}</div>
        <div className="mt-1 text-sm text-[#6B7A74]">{plan.subtitle}</div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#37413D]">{plan.description}</p>

      <div className="mt-4 space-y-2">
        {plan.bullets.map((b) => (
          <div key={b} className="text-sm text-[#0B0F0E]">
            • {b}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={plan.href}
          className={[
            "inline-flex rounded-2xl px-4 py-2 text-sm font-medium transition",
            plan.locked
              ? "border border-[#D7E4DD] bg-[#F7FAF8] text-[#6B7A74]"
              : "bg-[#22C55E] text-white hover:opacity-90",
          ].join(" ")}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  );
}

export default async function EducationPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    redirect("/auth?next=/education&mode=login");
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="text-4xl font-semibold leading-tight">Education</div>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            Structured stock education from absolute beginner to serious professional level.
            Start free with CORELEARN. Unlock deeper tracks later.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.title} {...plan} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold">Compare the tracks</div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6EEE9]">
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">CORELEARN</th>
                  <th className="py-3 pr-4">COREACADEMY</th>
                  <th className="py-3 pr-4">CORETEST</th>
                  <th className="py-3 pr-4">CORE検定</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Price</td>
                  <td className="py-3 pr-4">Free</td>
                  <td className="py-3 pr-4">$100 / 約¥15,000</td>
                  <td className="py-3 pr-4">$30 / 約¥4,500</td>
                  <td className="py-3 pr-4">$100 / 約¥15,000</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Audience</td>
                  <td className="py-3 pr-4">Beginners</td>
                  <td className="py-3 pr-4">Serious learners</td>
                  <td className="py-3 pr-4">Online test takers</td>
                  <td className="py-3 pr-4">Paper exam takers</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Language</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Progress saved</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Certification</td>
                  <td className="py-3 pr-4">Later</td>
                  <td className="py-3 pr-4">Later</td>
                  <td className="py-3 pr-4">Main feature</td>
                  <td className="py-3 pr-4">Main feature</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}