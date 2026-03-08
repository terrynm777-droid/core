import Link from "next/link";

type Plan = {
  title: string;
  subtitle: string;
  price: string;
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
    price: "Free",
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
    price: "¥9,800–¥29,800+",
    description:
      "Deep professional learning for serious traders and investors: strategies, frameworks, macro, risk, psychology, Python, and systems.",
    bullets: [
      "Advanced strategy tracks",
      "Risk and portfolio frameworks",
      "Trading systems",
      "Python / algo later",
    ],
    cta: "View plan",
    href: "/education/coreacademy",
    locked: true,
  },
  {
    title: "CORETEST / CORE検定",
    subtitle: "Assessment and certification",
    price: "¥3,000–¥12,000",
    description:
      "Formal testing and certification layer to verify actual skill and understanding.",
    bullets: [
      "Timed exams",
      "Question banks",
      "Certificates later",
      "Level-based validation",
    ],
    cta: "View plan",
    href: "/education/coretest",
    locked: true,
  },
];

function PlanCard({
  title,
  subtitle,
  price,
  description,
  bullets,
  cta,
  href,
  locked,
}: Plan) {
  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          <div className="mt-1 text-sm text-[#6B7A74]">{subtitle}</div>
        </div>
        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-1 text-sm font-medium">
          {price}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#37413D]">{description}</p>

      <div className="mt-4 space-y-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="text-sm text-[#0B0F0E]">
            • {bullet}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={href}
          className={[
            "inline-flex rounded-2xl px-4 py-2 text-sm font-medium transition",
            locked
              ? "border border-[#D7E4DD] bg-[#F7FAF8] text-[#0B0F0E] hover:bg-white"
              : "bg-[#22C55E] text-white hover:opacity-90",
          ].join(" ")}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default function EducationPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="text-4xl font-semibold leading-tight">CORE Education</div>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            Structured stock education from absolute beginner to serious professional level.
            Start free with CORELEARN. Unlock deeper tracks later.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
                  <th className="py-3 pr-4">CORETEST / CORE検定</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Price</td>
                  <td className="py-3 pr-4">Free</td>
                  <td className="py-3 pr-4">Paid</td>
                  <td className="py-3 pr-4">Paid</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Audience</td>
                  <td className="py-3 pr-4">Beginners</td>
                  <td className="py-3 pr-4">Serious learners</td>
                  <td className="py-3 pr-4">Assessment takers</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Language</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                  <td className="py-3 pr-4">EN / 日本語</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Progress saved</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Certification</td>
                  <td className="py-3 pr-4">Later</td>
                  <td className="py-3 pr-4">Later</td>
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