import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { coreLearnContent } from "@/app/education/corelearn/content";
import { Buffer } from "buffer";

function makeCourseCertificateCode() {
  return `CORELEARN-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
}

async function buildCertificatePdf({
  fullName,
  certificateCode,
  issuedAt,
}: {
  fullName: string;
  certificateCode: string;
  issuedAt: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const width = page.getWidth();
  const height = page.getHeight();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderWidth: 2,
    borderColor: rgb(0.84, 0.89, 0.87),
  });

  page.drawText("CORELEARN", {
    x: 60,
    y: height - 90,
    size: 18,
    font: fontBold,
    color: rgb(0.13, 0.77, 0.37),
  });

  page.drawText("Certificate of Completion", {
    x: 60,
    y: height - 140,
    size: 28,
    font: fontBold,
    color: rgb(0.04, 0.06, 0.05),
  });

  page.drawText("This certifies that", {
    x: 60,
    y: height - 200,
    size: 16,
    font: fontRegular,
    color: rgb(0.29, 0.36, 0.33),
  });

  page.drawText(fullName, {
    x: 60,
    y: height - 245,
    size: 30,
    font: fontBold,
    color: rgb(0.04, 0.06, 0.05),
  });

  page.drawText("has successfully completed the full CORELEARN course.", {
    x: 60,
    y: height - 295,
    size: 16,
    font: fontRegular,
    color: rgb(0.29, 0.36, 0.33),
  });

  page.drawText(`Certificate code: ${certificateCode}`, {
    x: 60,
    y: height - 380,
    size: 13,
    font: fontRegular,
    color: rgb(0.29, 0.36, 0.33),
  });

  page.drawText(`Issued at: ${new Date(issuedAt).toLocaleString()}`, {
    x: 60,
    y: height - 405,
    size: 13,
    font: fontRegular,
    color: rgb(0.29, 0.36, 0.33),
  });

  page.drawText("Educational use only. Not financial advice.", {
    x: 60,
    y: 70,
    size: 11,
    font: fontRegular,
    color: rgb(0.42, 0.48, 0.45),
  });

  return await pdfDoc.save();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const fullName = (body?.fullName ?? "Student").trim() || "Student";
  const downloadPdf = !!body?.downloadPdf;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lessonRows } = await supabase
    .from("education_lesson_progress")
    .select("level_id, lesson_slug")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .eq("completed", true);

  const { data: quizRows } = await supabase
    .from("education_level_quiz_attempts")
    .select("level_id, passed")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn");

  const completedSet = new Set(
    (lessonRows ?? []).map((row) => `${row.level_id}:${row.lesson_slug}`)
  );

  const allLessonsComplete = coreLearnContent.every((level) =>
    level.lessons.every((lesson) =>
      completedSet.has(`${level.id}:${lesson.slug}`)
    )
  );

  const passedSet = new Set(
    (quizRows ?? []).filter((row) => row.passed).map((row) => row.level_id)
  );

  const allQuizzesPassed = coreLearnContent.every((level) =>
    passedSet.has(level.id)
  );

  if (!allLessonsComplete || !allQuizzesPassed) {
    return NextResponse.json(
      { error: "Complete all lessons and pass all level quizzes first." },
      { status: 400 }
    );
  }

  let certificateCode: string;
  let issuedAt: string;

  const { data: existing, error: existingError } = await supabase
    .from("education_course_certificates")
    .select("certificate_code, issued_at")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.certificate_code) {
    certificateCode = existing.certificate_code;
    issuedAt = existing.issued_at;

    const { error: updateError } = await supabase
  .from("education_course_certificates")
  .update({ display_name: fullName } as any)
  .eq("user_id", auth.user.id)
  .eq("product_slug", "corelearn");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    certificateCode = makeCourseCertificateCode();
    issuedAt = new Date().toISOString();

    const { error: insertError } = await supabase
  .from("education_course_certificates")
  .insert({
    user_id: auth.user.id,
    product_slug: "corelearn",
    certificate_code: certificateCode,
    display_name: fullName,
    issued_at: issuedAt,
  } as any);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  if (!downloadPdf) {
    return NextResponse.json({
      ok: true,
      certificateCode,
      issuedAt,
      displayName: fullName,
    });
  }

  const pdfBytes = await buildCertificatePdf({
    fullName,
    certificateCode,
    issuedAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="corelearn-certificate.pdf"',
    },
  });
}