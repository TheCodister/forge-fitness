import Link from "next/link";
import { Activity, CalendarClock, Dumbbell, LineChart } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { APP_NAME } from "@/lib/constants";
import type { AppUser } from "@/types/domain";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/workouts", label: "Workouts", icon: CalendarClock },
  { href: "/templates", label: "Templates", icon: Dumbbell },
  { href: "/reports", label: "Reports", icon: LineChart },
];

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_28%),linear-gradient(180deg,_#111_0%,_#090909_42%,_#040404_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur lg:flex lg:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-orange-400">Forge</p>
            <h1 className="mt-2 text-2xl font-semibold">{APP_NAME}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Build templates, schedule sessions, and keep progress visible.
            </p>
          </div>
          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-zinc-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-orange-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">{user.displayName}</div>
            <div className="mt-1 text-xs text-zinc-400">{user.email}</div>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Forge</p>
              <div className="text-lg font-semibold">{APP_NAME}</div>
            </div>
            <LogoutButton />
          </div>
          <main className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
