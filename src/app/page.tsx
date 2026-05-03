import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[linear-gradient(150deg,_#040404_10%,_#0d0d0d_55%,_#1f1207_100%)] text-white">
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-0 opacity-80"
      />
      <section className="relative flex min-h-svh items-end px-5 pb-12 pt-20 md:px-10 md:pb-16 md:pt-24">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-orange-300">
              Forge Fitness
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.96] md:text-7xl">
              Train with precision, not noise.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300 md:text-lg">
              Plan sessions, execute with intention, and keep momentum visible
              in one focused workspace.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-medium text-black transition hover:bg-orange-400"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition hover:bg-white/8"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="self-end pb-1">
            <div className="space-y-5 border-l border-white/15 pl-5">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Inside Forge
              </p>
              <div className="space-y-3 text-sm text-zinc-300">
                <p>Template-driven planning for repeatable training blocks.</p>
                <p>
                  Session logging that keeps load, reps, and progression
                  obvious.
                </p>
                <p>
                  Reports that show rhythm, streak, and output without dashboard
                  clutter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 px-5 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 text-sm text-zinc-400 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Plan
            </p>
            <p className="mt-2">
              Build reusable templates and schedule with intent.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Execute
            </p>
            <p className="mt-2">
              Track every set and keep decisions grounded in data.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Progress
            </p>
            <p className="mt-2">
              See trends and adjust quickly from one unified view.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-7xl justify-end">
          <Link
            href="https://github.com/TheCodister"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-orange-400/40 hover:text-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/github.svg" alt="" aria-hidden className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
