import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Plan = {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  href: string;
  cta: string;
  priceLabel: string;
  buyHref?: string;
  paid?: boolean;
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
    href: "/education/corelearn",
    cta: "Start free",
    priceLabel: "Free",
    paid: false,
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
    href: "/education/coreacademy",
    cta: "View details",
    priceLabel: "$100 / 約¥15,000",
    buyHref: "/checkout/coreacademy",
    paid: true,
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
    href: "/education/coretest",
    cta: "View details",
    priceLabel: "$30 / 約¥4,500",
    buyHref: "/checkout/coretest",
    paid: true,
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
    href: "/education/coretest/kentei",
    cta: "View details",
    priceLabel: "$100 / 約¥15,000",
    buyHref: "/checkout/corekentei",
    paid: true,
  },
];

function PlanCard(plan: Plan) {
  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      <div>
        <div className="text-2xl font-semibold text-[#0B0F0E]">{plan.title}</div>
        <div className="mt-2 text-sm text-[#6B7A74]">{plan.subtitle}</div>
      </div>

      <div className="mt-4 text-sm font-medium text-[#16A34A]">
        {plan.priceLabel}
      </div>

      <p className="mt-5 text-base leading-8 text-[#37413D]">
        {plan.description}
      </p>

      <div className="mt-5 space-y-2">
        {plan.bullets.map((b) => (
          <div key={b} className="text-sm text-[#0B0F0E]">
            • {b}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={plan.href}
          className={[
            "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition",
            plan.paid
              ? "border border-[#D7E4DD] bg-white text-[#0B0F0E] hover:bg-[#F7FAF8]"
              : "bg-[#22C55E] text-white hover:brightness-95",
          ].join(" ")}
        >
          {plan.cta}
        </Link>

        {plan.buyHref ? (
          <Link
            href={plan.buyHref}
            className="inline-flex items-center justify-center rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white transition hover:brightness-95"
          >
            Buy now
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default async function EducationPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth?next=/education&mode=login");
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-12 text-[#0B0F0E]">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <div className="text-sm font-semibold text-[#16A34A]">
            CORE Education
          </div>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#0B0F0E]">
            Learn stocks properly from zero.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#37413D]">
            Structured stock education from absolute beginner to serious professional level.
            Start free with CORELEARN. Unlock deeper tracks through paid products.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.title} {...plan} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold text-[#0B0F0E]">Compare the tracks</div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6EEE9]">
                  <th className="py-3 pr-4 text-[#0B0F0E]">Feature</th>
                  <th className="py-3 pr-4 text-[#0B0F0E]">CORELEARN</th>
                  <th className="py-3 pr-4 text-[#0B0F0E]">COREACADEMY</th>
                  <th className="py-3 pr-4 text-[#0B0F0E]">CORETEST</th>
                  <th className="py-3 pr-4 text-[#0B0F0E]">CORE検定</th>
                </tr>
              </thead>
              <tbody className="text-[#37413D]">
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