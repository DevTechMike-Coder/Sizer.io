"use client";

import Link from "next/link";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[350px] rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-blue-500/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-background p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-500 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Zero Sizing Errors Starting Today</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Take Control of Your Trading Risk Today.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Join thousands of profitable traders who protect their capital first and let their edge do the rest.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/25 transition-transform hover:scale-[1.03] cursor-pointer"
            >
              <Link href="/auth/signup" className="flex items-center gap-2">
                <span>Start Sizing Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-6 rounded-xl border-border bg-background hover:bg-muted font-semibold transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Link href="/sizer">
                Try Live Sizer
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
