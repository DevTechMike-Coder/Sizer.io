import Link from "next/link";
import { LiveChart } from "@/components/uiComponents/marketTerminal/LiveChart";
import { Activity, ArrowLeft, Calculator, ShieldCheck, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Market() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
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
              <span>Live Terminal Telemetry</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20">
              <Link href="/sizer" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span>Open Position Sizer</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Live Institutional Market Terminal
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-muted-foreground">
            Real-time multi-asset technical charting powered by TradingView Lightweight Charts™ v5. Track candle volatility, EMA/SMA crossovers, and export live price marks directly into your position sizer.
          </p>
        </div>

        {/* The Live Interactive Chart */}
        <div className="mb-10">
          <LiveChart />
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Multi-Asset Feeds</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seamlessly toggle between Crypto, Equity Index ETFs, Mega-caps, Forex majors, and Commodities.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-cyan-400 mb-1.5">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Sub-second Latency</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ultra-responsive candle engine updating OHLC prices with live volume distribution histograms.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-amber-400 mb-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Direct Risk Sync</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One-click export of current market prices into the institutional risk sizing calculator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}