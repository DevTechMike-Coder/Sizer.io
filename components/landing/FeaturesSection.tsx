"use client";

import {
  ShieldAlert,
  Percent,
  Sliders,
  TrendingUp,
  Cpu,
  Lock,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Sliders,
    title: "Exact Micro-Lot Sizing Engine",
    description:
      "Eliminate guessing lot sizes. Automatically accounts for account currency, pip value, contract size, and broker leverage across 200+ instruments.",
    tag: "Core Algorithm",
  },
  {
    icon: ShieldAlert,
    title: "Prop Firm Drawdown Shield",
    description:
      "Stay compliant with FTMO, FundedNext, and Topstep rules. Enforces daily loss limits and trailing maximum drawdown thresholds automatically.",
    tag: "Prop Risk",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Risk-to-Reward Modeler",
    description:
      "Simulate multiple take-profit tiers (TP1, TP2, Runner) and visualize break-even stop moves before pulling the trigger.",
    tag: "Trade Strategy",
  },
  {
    icon: Cpu,
    title: "Real-Time Cross Market Feeds",
    description:
      "Integrated TradingView charts and Twelve Data WebSocket telemetry keep you informed of macro trends and high-volatility shifts before entering.",
    tag: "Live Data",
  },
  {
    icon: Lock,
    title: "Anti-Tilt Discipline Guard",
    description:
      "Set strict maximum daily risk caps. Prevent revenge trading and emotional over-leveraging with automated discipline alerts.",
    tag: "Psychology",
  },
  {
    icon: Layers,
    title: "Instant Parameter Export",
    description:
      "Copy trade sizing, stop loss points, and position tickets directly to your clipboard for instant entry on MT4/MT5, cTrader, or Bybit.",
    tag: "Workflow",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-20 py-16 lg:py-24 border-t border-border/40 bg-muted/20 overflow-hidden">
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
            <span>Built For Disciplined Traders</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Institutional Risk Rules. Simplified for You.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Most traders fail not because of their entry strategy, but because of poor position sizing.
            Sizer.io fixes the math so you can focus on executing.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/40 hover:shadow-emerald-500/5 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
