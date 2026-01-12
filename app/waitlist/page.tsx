export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">Join Core</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Early access for traders who value signal over noise.
      </p>

      <form className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="email"
          placeholder="you@email.com"
          className="px-4 py-3 rounded bg-gray-900 border border-gray-700 outline-none"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Request Access
        </button>
      </form>
    </main>
  );
}