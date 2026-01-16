import Link from "next/link";

export default function RootPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Choose language</h1>

      <div className="flex gap-3">
        <Link
          href="/en"
          className="px-5 py-3 rounded-lg border border-gray-600 hover:border-gray-300 transition"
        >
          🇺🇸 English
        </Link>

        <Link
          href="/ja"
          className="px-5 py-3 rounded-lg border border-gray-600 hover:border-gray-300 transition"
        >
          🇯🇵 日本語
        </Link>
      </div>
    </main>
  );
}