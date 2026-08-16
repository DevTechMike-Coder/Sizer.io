"use client";

import { useState } from "react";
import { Activity, BarChart3, Globe, Coins, ShieldCheck, Sparkles } from "lucide-react";
import { SymbolOverviewWidget } from "@/components/marketSummaryComp/symbol-overview-widget";
import { TVMarketOverview } from "@/components/marketSummaryComp/tv-market-overview";
import { CryptoMarketTable } from "@/components/marketSummaryComp/crypto-market-cap";

type MarketTab = "CHART" | "SECTORS" | "CRYPTO";

export function MarketTerminalSection() {
  const [activeTab, setActiveTab] = useState<MarketTab>("CHART");

  return (
    <section id="markets" className="relative scroll-mt-20 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Global Market Telemetry</span>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Live Cross-Asset Terminal
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor equities, commodities, forex pairs, and crypto assets in real time before calculating position risk.
            </p>
          </div>

          {/* Tab Navigation Selector */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
            <div className="flex w-max sm:w-auto items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab("CHART")}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "CHART"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Multi-Asset Chart</span>
                <span className="sm:hidden">Chart</span>
              </button>

              <button
                onClick={() => setActiveTab("SECTORS")}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "SECTORS"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sector Heatmap</span>
                <span className="sm:hidden">Sectors</span>
              </button>

              <button
                onClick={() => setActiveTab("CRYPTO")}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "CRYPTO"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Crypto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab View Container */}
        <div className="relative">
          {activeTab === "CHART" && (
            <div className="animate-in fade-in duration-300">
              <SymbolOverviewWidget />
            </div>
          )}

          {activeTab === "SECTORS" && (
            <div className="animate-in fade-in duration-300">
              <TVMarketOverview />
            </div>
          )}

          {activeTab === "CRYPTO" && (
            <div className="animate-in fade-in duration-300">
              <CryptoMarketTable />
            </div>
          )}
        </div>

        {/* Bottom Quick-View Ticker Hint */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>TradingView™ & CoinGecko™ Low Latency Data feeds enabled.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Ticks: Live</span>
            <span>•</span>
            <span>Quotes: Global</span>
            <span>•</span>
            <span>Status: Connected</span>
          </div>
        </div>
      </div>
    </section>
  );
}
