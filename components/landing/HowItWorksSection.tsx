"use client";

import { CheckCircle2, Shield, Crosshair, ArrowRight, Zap, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const STEPS = [
  {
    step: "01",
    title: "Define Your Capital & Risk Limit",
    description:
      "Input your total account equity and set your personal risk percentage per trade (e.g., 0.5% or 1%). Sizer automatically locks in your maximum dollar downside.",
    badge: "Step 1",
  },
  {
    step: "02",
    title: "Set Technical Invalidation Points",
    description:
      "Choose your asset and enter your planned entry price, technical stop loss level, and profit target. Sizer calculates exact distance and pip/point valuations.",
    badge: "Step 2",
  },
  {
    step: "03",
    title: "Execute Flawlessly on Your Broker",
    description:
      "Receive the exact lot size, contract units, or coin volume. Copy the trade blueprint into MT4/5, TradingView, or exchange and trade with 100% confidence.",
    badge: "Step 3",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 py-16 lg:py-24 overflow-hidden">
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
            <Zap className="h-3.5 w-3.5" />
            <span>Simple 3-Step Workflow</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            From Setup to Execution in Seconds
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            No spreadsheets. No mental math during high volatility. Just pure execution.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-3xl font-black text-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                    {item.step}
                  </span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-500 pt-4 border-t border-border/40">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Calculation Lag</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
