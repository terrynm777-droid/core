import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("portfolio, portfolio_public")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      portfolio: data?.portfolio ?? [],
      portfolio_public: data?.portfolio_public ?? false,
    },
    { status: 200 }
  );
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { portfolio?: any; portfolio_public?: any }
    | null;

  const portfolio = body?.portfolio;
  const portfolio_public = body?.portfolio_public;

  if (!Array.isArray(portfolio)) {
    return NextResponse.json(
      { error: "Portfolio must be a list." },
      { status: 400 }
    );
  }

  const pub = Boolean(portfolio_public);

  const { error } = await supabase
    .from("profiles")
    .update({
      portfolio,
      portfolio_public: pub,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}