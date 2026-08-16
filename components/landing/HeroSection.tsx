"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  Activity,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-[120px] dark:from-emerald-500/20 dark:via-teal-500/15" />
        <div className="absolute top-[40%] -left-[10%] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute top-[30%] -right-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Release / Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-500 shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
          <span>Institutional-Grade Trading Risk Architecture</span>
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">
            Forex • Crypto • Indices • Stocks
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Eliminate Ruin Risk.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Size Every Trade
          </span>{" "}
          With Precision.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
          The all-in-one risk operating system for serious market participants.
          Calculate exact position sizing, enforce prop firm drawdown limits,
          and monitor live global feeds before putting a single dollar on the
          line.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <Button
            asChild
            size="lg"
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Link href="/sizer" className="flex items-center gap-2">
              <Calculator className="h-4.5 w-4.5" />
              <span>Launch Live Position Sizer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 rounded-xl border-border/80 bg-card/60 backdrop-blur hover:bg-muted font-semibold transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Link href="/market" className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              <span>Live Market Terminal</span>
            </Link>
          </Button>
        </div>

        {/* Trust Badges Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Zero Account Link Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Real-Time Market Feeds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Prop Firm Rules Preset</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-4.5 shadow-xl backdrop-blur-md">
            <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl font-mono">
              $140M+
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Trade Risk Calculated
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/50 p-4.5 shadow-xl backdrop-blur-md">
            <div className="text-2xl font-black tracking-tight text-emerald-500 sm:text-3xl font-mono">
              48,000+
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Disciplined Traders
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/50 p-4.5 shadow-xl backdrop-blur-md">
            <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl font-mono">
              0.001
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Micro Lot Precision
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/50 p-4.5 shadow-xl backdrop-blur-md">
            <div className="text-2xl font-black tracking-tight text-blue-500 sm:text-3xl font-mono">
              100%
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Drawdown Compliant
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
