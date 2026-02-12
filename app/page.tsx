import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CoreLogo from "@/app/components/CoreLogo";

export default async function HomePage() {
  const supabase = await createClient(); // <- IMPORTANT if createClient is async

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = !!user;

  return (
    <main className="min-h-screen bg-[#F7FAF8]">
      <div className="flex justify-end p-6">
        <Link href="/" aria-label="Home">
          <CoreLogo />
        </Link>
      </div>

      <div className="mx-auto max-w-xl px-6 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight">Core</h1>
        <p className="mt-3 text-sm text-[#6B7A74]">
          {loggedIn ? "You're logged in." : "Create an account or log in to enter the chat."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {loggedIn ? (
            <Link
              href="/feed"
              className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-center text-white font-medium"
            >
              Enter chat
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-center text-white font-medium"
              >
                Sign up
              </Link>
              <Link
                href="/auth/login"
                className="w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-center font-medium"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}