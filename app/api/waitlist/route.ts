import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const form = new FormData();
    // IMPORTANT: field name must match Tally exactly
    form.append("Email", email);

    const res = await fetch("https://tally.so/r/RGoxMJ", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Tally failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
