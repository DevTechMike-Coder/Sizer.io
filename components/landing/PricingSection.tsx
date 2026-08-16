"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const TIERS = [
  {
    name: "Starter Trader",
    price: "$0",
    period: "Forever Free",
    description: "Essential position sizing and live market telemetry for retail traders.",
    features: [
      "Real-Time Position Sizer (Forex, Crypto, Stocks)",
      "Live TradingView Charts & Sector Heatmaps",
      "Twelve Data WebSocket Live Telemetry",
      "Instant Risk-to-Reward Ratio Calculator",
      "Standard Micro/Mini/Standard Lot Presets",
    ],
    cta: "Start Free",
    href: "/auth/signup",
    popular: false,
  },
  {
    name: "Pro Risk Manager",
    price: "$19",
    period: "per month",
    description: "Advanced drawdown controls and multi-tier target sizing for serious & funded traders.",
    features: [
      "Everything in Starter, plus:",
      "Prop Firm Mode (FTMO, Topstep, FundedNext presets)",
      "Daily Max Loss & Trailing Drawdown Lockouts",
      "Multi-Tier Take Profit Modeler (TP1, TP2, Runner)",
      "Custom Broker Commission & Spread Adjustments",
      "One-Click MT4/MT5 & Exchange Setup Exporter",
      "Saved Risk Profiles & Multi-Account Switching",
    ],
    cta: "Start 7-Day Free Trial",
    href: "/auth/signup",
    popular: true,
  },
  {
    name: "Fund & Syndicate",
    price: "$79",
    period: "per month",
    description: "Institutional risk governance for trading desks, prop groups, and syndicates.",
    features: [
      "Everything in Pro Risk Manager, plus:",
      "Multi-Seat Trader Risk Management Dashboard",
      "Real-Time Account Exposure Aggregation",
      "Automated Risk Rule Enforcement Webhooks",
      "Custom Asset Pip/Tick Calibration",
      "Priority 24/7 Institutional Support",
    ],
    cta: "Contact Sales",
    href: "/auth/signup",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-20 py-16 lg:py-24 border-t border-border/40 bg-muted/20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Protect Your Capital For Less Than One Bad Trade
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Save thousands in avoided slippage and overleveraged losses with disciplined mathematical sizing.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: "easeOut" }}
              whileHover={{ y: tier.popular ? -6 : -4, transition: { duration: 0.2 } }}
              className={`relative flex flex-col justify-between rounded-2xl border p-8 shadow-xl backdrop-blur-md transition-all ${
                tier.popular
                  ? "border-emerald-500/60 bg-card shadow-emerald-500/10 ring-1 ring-emerald-500/50 lg:-translate-y-2 z-10"
                  : "border-border/60 bg-card/60"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                  Most Popular for Prop Traders
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono text-foreground">{tier.price}</span>
                  <span className="text-xs text-muted-foreground font-medium">{tier.period}</span>
                </div>

                <div className="my-6 border-t border-border/50" />

                <ul className="space-y-3 text-xs text-muted-foreground">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="text-foreground/90">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  asChild
                  variant={tier.popular ? "default" : "outline"}
                  size="lg"
                  className={`w-full rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-[1.02] cursor-pointer ${
                    tier.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Link href={tier.href} className="flex items-center justify-center gap-1.5">
                    <span>{tier.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
