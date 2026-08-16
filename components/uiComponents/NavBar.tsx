"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, TrendingUp, Menu, X, ArrowRight, Zap, Activity, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionUser {
  name: string | null;
  email: string;
}

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setUser(data.authenticated ? data.user : null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
              <Shield className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 transition-colors group-hover:text-blue-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-foreground uppercase">
                Sizer<span className="text-blue-600 dark:text-blue-400">.io</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline -mt-0.5">
              Risk Operating System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            href="/sizer"
            className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Position Sizer
          </Link>
          <Link
            href="/market"
            className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Market Terminal
          </Link>
          <Link
            href="/#features"
            className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop Actions + Theme Switcher */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />

          {authChecked && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 pl-2 pr-2.5 py-1.5 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 text-[11px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="max-w-[110px] truncate text-sm font-semibold text-foreground">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sizer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <span>Position Sizer</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Log In
              </Link>

              <Button asChild size="sm" className="h-8.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/25 transition-transform hover:scale-[1.02]">
                <Link href="/auth/signup" className="flex items-center gap-1.5">
                  <span>Start Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Action & Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            <Link
              href="/sizer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted flex items-center justify-between"
            >
              <span>Position Sizer</span>
              <Zap className="h-4 w-4 text-blue-500" />
            </Link>
            <Link
              href="/market"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted flex items-center justify-between"
            >
              <span>Market Terminal</span>
              <Activity className="h-4 w-4 text-cyan-500" />
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Pricing
            </Link>

            <div className="my-2 border-t border-border/50 pt-2 flex flex-col gap-2">
              {authChecked && user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2.5"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 text-[10px] font-bold text-white">
                      {initials}
                    </div>
                    <span className="truncate">{user.name || user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold text-foreground hover:bg-muted rounded-lg"
                  >
                    Log In
                  </Link>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      Create Free Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
