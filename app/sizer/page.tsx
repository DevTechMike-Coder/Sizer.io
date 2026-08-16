import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PositionSizerWorkstation } from "@/components/sizer/PositionSizerWorkstation";
import { Activity, ArrowLeft, ShieldCheck, Sparkles, TrendingUp, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Position Sizer & Risk Management Workstation · Sizer.io",
  description:
    "Calculate precise lot sizes, standard lots, stop loss risk dollar amounts, and risk-to-reward ratios for Forex, Crypto, Stocks, and Commodities.",
};

export default function SizerPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      {/* Top Ambient Glow & Grid Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header Navigation */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-border/80 bg-card/60">
              <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/60" />
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Risk Management Workstation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20">
              <Link href="/market" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Open Market Terminal</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* The Interactive Workstation Wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="w-full h-96 flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-card/40">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
              <span className="text-xs font-mono text-muted-foreground">Loading Risk Workstation…</span>
            </div>
          }
        >
          <PositionSizerWorkstation />
        </Suspense>

        {/* Informational Guidance Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/40">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Asymmetrical Risk Geometry</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Target a minimum 1:2.0 Risk-to-Reward ratio on every trade. This ensures profitability even with a 40% win rate.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Drawdown Preservation</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Limit maximum risk per trade to 0.5% – 1.0% of total equity to stay well within prop firm max trailing drawdown thresholds.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-3">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Standardized Lot Valuation</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Automatic conversion between Forex Standard Lots (100k units), Mini Lots (10k units), and crypto fractional coin amounts.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}