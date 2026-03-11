import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { coreLearnContent } from "../content";

export default async function CourseCertificatePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    redirect("/auth?next=/education/corelearn/certificate&mode=login");
  }

  const { data: cert } = await supabase
    .from("education_course_certificates")
    .select("certificate_code, issued_at")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .maybeSingle();

  const totalLessons = coreLearnContent.reduce((acc, level) => acc + level.lessons.length, 0);

  const { count } = await supabase
    .from("education_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .eq("completed", true);

  const completedLessons = count ?? 0;
  const ready = completedLessons === totalLessons && !!cert;

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-12 text-[#0B0F0E]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/education/corelearn/dashboard"
          className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
        >
          Back to dashboard
        </Link>

        <div className="mt-6 rounded-[2rem] border border-[#D7E4DD] bg-white p-10 shadow-sm">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-[#16A34A]">
              CORE Certificate
            </div>

            <h1 className="mt-6 text-4xl font-semibold">
              CORELEARN Completion Certificate
            </h1>

            <p className="mt-4 text-lg leading-8 text-[#37413D]">
              This certifies successful completion of the CORELEARN foundational
              stock education track.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-8">
            <div className="text-sm text-[#6B7A74]">Awarded to</div>
            <div className="mt-2 text-3xl font-semibold">{auth.user.email}</div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5">
                <div className="text-sm text-[#6B7A74]">Course</div>
                <div className="mt-2 text-lg font-semibold">CORELEARN</div>
              </div>

              <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5">
                <div className="text-sm text-[#6B7A74]">Status</div>
                <div className="mt-2 text-lg font-semibold">
                  {ready ? "Issued" : "Not available yet"}
                </div>
              </div>

              <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5">
                <div className="text-sm text-[#6B7A74]">Certificate code</div>
                <div className="mt-2 text-lg font-semibold">
                  {cert?.certificate_code ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5">
                <div className="text-sm text-[#6B7A74]">Issued date</div>
                <div className="mt-2 text-lg font-semibold">
                  {cert?.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>

            {!ready ? (
              <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-white p-5 text-sm text-[#37413D]">
                Complete all lessons and claim the certificate from your dashboard first.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}