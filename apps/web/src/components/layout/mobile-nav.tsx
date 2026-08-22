"use client";

import { useState } from "react";
import {
  Activity,
  BookOpen,
  BotMessageSquare,
  CalendarClock,
  Dumbbell,
  LineChart,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import type { AppUser } from "@/types/domain";
import { LogoutButton } from "./logout-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/workouts", label: "Workouts", icon: CalendarClock },
  { href: "/templates", label: "Templates", icon: Dumbbell },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/trainer", label: "AI Trainer", icon: BotMessageSquare },
];

export function MobileNav({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="border border-white/15 bg-white/5 hover:border-orange-400/40 hover:bg-orange-500/10"
          />
        }
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-black/95 border-white/10 p-6 flex flex-col">
        <SheetHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-orange-400">Forge</p>
            <SheetTitle className="mt-1 text-xl font-semibold text-white">{APP_NAME}</SheetTitle>
          </div>
        </SheetHeader>
        <nav className="mt-8 space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                  isActive
                    ? "border-orange-400/50 bg-orange-500/12 text-white"
                    : "border-transparent text-zinc-300 hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 text-orange-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="text-sm font-medium">{user.name ?? user.email}</div>
          <div className="mt-1 text-xs text-zinc-400">{user.email}</div>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
