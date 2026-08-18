"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AppNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
        isActive
          ? "border-orange-400/50 bg-orange-500/12 text-white"
          : "border-transparent text-zinc-300 hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-white",
        className,
      )}
    >
      {children}
    </Link>
  );
}
