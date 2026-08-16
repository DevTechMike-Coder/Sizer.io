"use client";

import { Star, ShieldCheck, Quote } from "lucide-react";
import { motion } from "motion/react";

const TESTIMONIALS = [
  {
    quote:
      "Sizer.io saved my funded accounts. In the past I'd accidentally risk 3% instead of 1% on gold volatility. Now I punch the numbers into Sizer before every single order.",
    author: "Marcus Vance",
    role: "Funded FX & Gold Trader ($200k Account)",
    rating: 5,
  },
  {
    quote:
      "The combination of the live TradingView sector feed and the immediate lot size calculation is killer. It takes 5 seconds to get exact position sizing.",
    author: "Elena Rostova",
    role: "Crypto Futures & Scalp Trader",
    rating: 5,
  },
  {
    quote:
      "Having prop firm drawdown safety presets prevents the daily limit blowups that kill 90% of traders. Indispensable tool for disciplined trading.",
    author: "David Chen",
    role: "Index Futures Trader (NQ & ES)",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Trader Testimonials</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Trusted by 48,000+ Disciplined Traders
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
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
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-foreground/90 italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40">
                <div className="font-bold text-sm text-foreground">{item.author}</div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
