"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  RefreshCw,
  StickyNote,
  FileText,
  Timer,
  LogOut,
  Menu,
  X,
  BarChart3,
  Video,
  Paperclip,
  User,
  Flame,
  Trophy,
  Sparkles,
  PieChart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/logout";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: BookOpen },
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/practice", label: "Practice (Record)", icon: Video },
  { href: "/files", label: "Your files", icon: Paperclip },
  { href: "/hours", label: "Activity & streak", icon: Flame },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/progress", label: "Progress %", icon: PieChart },
  { href: "/dsa", label: "Problems", icon: Code2 },
  { href: "/revision", label: "Revision", icon: RefreshCw },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/blog", label: "Reflections", icon: FileText },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const firstName = userName?.split(" ")[0] || "there";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 backdrop-blur px-2 sm:px-4 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/dashboard" className="shrink-0 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            PrepJourney
          </Link>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <p className="hidden sm:block truncate text-sm text-slate-500 dark:text-slate-400">
            Welcome back,{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">{firstName}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 max-w-[140px] sm:max-w-[180px]"
            title={userEmail || "Profile"}
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate hidden sm:inline">{userName || "Profile"}</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 top-14 z-40 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed top-14 left-0 z-40 flex h-[calc(100vh-3.5rem)] w-[min(16rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
          <Link
            href="/profile"
            className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {userName || "User"}
            </p>
            {userEmail && (
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            )}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
