import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">About Core</h1>
      <p className="text-gray-400 text-center max-w-xl mb-10">
        Core is a clean, global finance community: discussion, news context,
        and learning—built to reduce noise and increase signal.
      </p>

      <Link href="/" className="text-gray-300 underline">
        Back home
      </Link>
    </main>
  );
}
