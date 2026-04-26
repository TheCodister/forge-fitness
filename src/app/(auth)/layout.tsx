export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.22),_transparent_28%),linear-gradient(180deg,_#111_0%,_#090909_42%,_#040404_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center gap-10">
        <div className="hidden max-w-lg space-y-6 lg:block">
          <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Forge Fitness</p>
          <h1 className="text-5xl font-semibold leading-tight">
            Train with structure. Track with intention.
          </h1>
          <p className="text-lg leading-8 text-zinc-300">
            Build reusable workout templates, schedule sessions with precision, and keep a clear picture of your progress over time.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
