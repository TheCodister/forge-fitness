import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.22),_transparent_30%),linear-gradient(180deg,_#111_0%,_#090909_42%,_#040404_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-12 rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur lg:p-14">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs uppercase tracking-[0.45em] text-orange-400">Forge Fitness</p>
          <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
            Your workout tracker should feel as focused as your training.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-300">
            Build reusable templates, schedule exact sessions, log results, and keep your momentum visible with summary reports and exercise progress snapshots.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-medium text-black transition hover:bg-orange-400"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-6 text-sm font-medium text-white transition hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
