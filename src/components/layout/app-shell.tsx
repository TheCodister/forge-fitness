import {
  Activity,
  BookOpen,
  BotMessageSquare,
  CalendarClock,
  Dumbbell,
  LineChart,
} from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { AppNavLink } from "@/components/layout/nav-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { AppUser } from "@/types/domain";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/workouts", label: "Workouts", icon: CalendarClock },
  { href: "/templates", label: "Templates", icon: Dumbbell },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/trainer", label: "AI Trainer", icon: BotMessageSquare },
];

function ForgeBrandMark({ size = 24 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
        <rect fill="#FF5A1F" width="32" height="32" rx="9" ry="9" />
        <path fill="#0A0604" d="M 7 7 H 25 V 13 H 13 V 14 H 20 V 18 H 13 V 25 H 7 Z" />
        <path fill="#0A0604" d="M 22.5 20 L 25 22.5 L 22.5 25 L 20 22.5 Z" />
      </svg>
    </span>
  );
}

function UserInitials({ name, email }: { name?: string | null; email: string }) {
  const raw = name ?? email;
  const parts = raw.trim().split(/[\s@]+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : raw.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%",
      background: "#1C1D21",
      border: "1px solid rgba(255,255,255,0.14)",
      display: "grid", placeItems: "center",
      fontWeight: 800, fontSize: 12,
      letterSpacing: "-0.02em",
      color: "#FAFAFA",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh text-white" style={{ background: "#060607" }}>
      <div className="mx-auto flex min-h-svh w-full max-w-7xl gap-4 px-4 py-5 lg:gap-5 lg:px-5 lg:py-5">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex lg:flex-col"
          style={{
            width: 264,
            flexShrink: 0,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "#08080A",
            overflow: "hidden",
          }}
        >
          {/* Brand header */}
          <div style={{
            padding: "18px 18px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Link
              href="/"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                textDecoration: "none", color: "#FAFAFA",
                fontWeight: 900, fontSize: 15,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "var(--font-heading, inherit)",
              }}
            >
              <ForgeBrandMark size={26} />
              Forge Fitness
            </Link>
            <p style={{
              margin: "8px 0 0",
              fontFamily: "ui-monospace, monospace",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#5A5B62",
            }}>
              Training dashboard
            </p>
          </div>

          {/* Nav */}
          <nav style={{ padding: "10px 10px", flex: 1 }}>
            <p style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#3A3B41",
              padding: "8px 8px 4px",
              margin: 0,
            }}>Navigate</p>
            <div className="space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <AppNavLink key={item.href} href={item.href}>
                    <Icon className="h-4 w-4 text-orange-500" />
                    <span>{item.label}</span>
                  </AppNavLink>
                );
              })}
            </div>
          </nav>

          {/* User footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <UserInitials name={user.name} email={user.email} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#FAFAFA",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.name ?? user.email.split("@")[0]}
              </div>
              <div style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#5A5B62", marginTop: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.email}
              </div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <div
            className="mb-4 flex items-center justify-between lg:hidden"
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "#08080A",
              padding: "12px 16px",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <ForgeBrandMark size={22} />
              <div>
                <p style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.35em",
                  textTransform: "uppercase", color: "#FF5A1F", margin: 0,
                }}>Forge</p>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FAFAFA", lineHeight: 1.2 }}>
                  Fitness
                </div>
              </div>
            </Link>
            <MobileNav user={user} />
          </div>

          {/* Page content */}
          <main
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "#0A0A0C",
              padding: "28px 32px",
            }}
          >
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
