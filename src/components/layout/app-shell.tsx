import {
  Activity,
  BookOpen,
  CalendarClock,
  Dumbbell,
  LineChart,
} from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { AppNavLink } from "@/components/layout/nav-link";
import { APP_NAME } from "@/lib/constants";
import type { AppUser } from "@/types/domain";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/workouts", label: "Workouts", icon: CalendarClock },
  { href: "/templates", label: "Templates", icon: Dumbbell },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
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
    <div className="min-h-svh bg-[linear-gradient(160deg,_#070707_0%,_#111_55%,_#1f1207_100%)] text-white">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl gap-4 px-4 py-5 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-black/55 p-6 lg:flex lg:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-orange-400">
              Forge
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{APP_NAME}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Build templates, schedule sessions, and keep progress visible.
            </p>
          </div>
          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <AppNavLink key={item.href} href={item.href}>
                  <Icon className="h-4 w-4 text-orange-400" />
                  <span>{item.label}</span>
                </AppNavLink>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/4 p-4">
            <div className="text-sm font-medium">{user.displayName}</div>
            <div className="mt-1 text-xs text-zinc-400">{user.email}</div>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-black/55 px-5 py-4 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-400">
                Forge
              </p>
              <div className="text-lg font-semibold">{APP_NAME}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="https://github.com/TheCodister"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-orange-400/40 hover:bg-orange-500/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/github.svg" alt="" aria-hidden className="h-4 w-4" />
              </Link>
              <LogoutButton />
            </div>
          </div>
          <main className="rounded-3xl border border-white/10 bg-black/45 p-5 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
