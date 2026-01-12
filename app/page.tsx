import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
        Core
      </h1>

      <p className="text-gray-400 text-center max-w-xl mb-10">
        The core of global markets, stocks, and financial discussion. Clean
        signal. Zero noise.
      </p>

      <div className="flex gap-4">
        <Link
          href="/waitlist"
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Join Early
        </Link>

        <Link
          href="/about"
          className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-400 transition"
        >
          Learn More
        </Link>
      </div>

      <div className="mt-16 text-sm text-gray-600">
        Built for traders · investors · students
      </div>
    </main>
  );
}