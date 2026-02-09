import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/feed");

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Feed</h1>

          <div className="flex gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95"
            >
              Post
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl border border-[#D7E4DD] bg-white font-medium hover:shadow-sm"
            >
              Refresh
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
              {error.message}
            </div>
          ) : (posts ?? []).length === 0 ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 text-sm text-[#4B5A55]">
              No posts yet.
            </div>
          ) : (
            (posts ?? []).map((p) => (
              <div key={p.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
                <div className="text-base font-medium whitespace-pre-wrap">{p.content}</div>
                <div className="mt-3 text-xs text-[#6B7A74]">
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}