import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { coreLearnContent } from "../../content";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = coreLearnContent.find((item) => item.id === levelId);
  if (!level) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) notFound();

  const { data: cert } = await supabase
    .from("education_certificates")
    .select("certificate_code, issued_at")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .eq("level_id", levelId)
    .maybeSingle();

  if (!cert) notFound();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/education/corelearn/${levelId}`}
          className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
        >
          Back to level
        </Link>

        <div className="mt-6 rounded-3xl border border-[#D7E4DD] bg-white p-10 shadow-sm">
          <div className="text-sm text-[#6B7A74]">CORELEARN Certificate</div>
          <h1 className="mt-3 text-3xl font-semibold">{level.title}</h1>
          <p className="mt-4 text-base leading-8 text-[#4B5B55]">
            This certificate confirms completion requirements for this CORELEARN level.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5 text-sm">
              <div className="font-semibold">Certificate code</div>
              <div className="mt-2">{cert.certificate_code}</div>
            </div>
            <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5 text-sm">
              <div className="font-semibold">Issued at</div>
              <div className="mt-2">{new Date(cert.issued_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5 text-sm text-[#4B5B55]">
            Educational content developed with AI-assisted drafting and human editorial review.
            For educational use only. Not financial advice.
          </div>
        </div>
      </div>
    </main>
  );
}