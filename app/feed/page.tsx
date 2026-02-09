// app/feed/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth?next=/feed");

  return <FeedClient />;
}