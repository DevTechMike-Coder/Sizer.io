"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  Lock,
  CheckCircle,
} from "lucide-react";

export function AuthVisualHero() {
  const [, setPulseCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((p) => (p + 1) % 1000);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full h-full min-h-[640px] rounded-3xl overflow-hidden border border-zinc-800/80 bg-[#080B11] p-8 lg:p-12 shadow-2xl text-zinc-100 selection:bg-blue-500 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-blue-700/10 blur-[100px]" />

      {/* Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Header / Telemetry Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono font-medium text-blue-400 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <Zap className="h-3.5 w-3.5 text-blue-400" />
          <span>INSTITUTIONAL RISK MATRIX · ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Activity className="h-3.5 w-3.5 text-blue-400" />
          <span>LIVE WS 60fps</span>
        </div>
      </div>

      {/* Center: Interactive Animated Trading Signal Canvas */}
      <div className="relative z-10 my-auto py-8">
        {/* Floating Signal Header Card */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="h-6 w-6 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">NVDA · BREAKOUT SIGNAL</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                  LONG / BUY
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Entry: $224.50 · Stop: $221.80 · Size: 240 Units</p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs text-zinc-500">Projected Return</div>
            <div className="text-base font-extrabold text-cyan-400">+$2,480.00 (+4.8R)</div>
          </div>
        </div>

        {/* Animated Visual Breakout Graphic */}
        <div className="relative h-60 w-full rounded-2xl border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Target Levels Guides */}
          <div className="absolute inset-x-4 top-8 flex items-center justify-between border-b border-dashed border-cyan-500/30 pb-1 text-[10px] font-mono text-cyan-400">
            <span>TP3 (Extended Expansion)</span>
            <span>$234.20 (+4.3%)</span>
          </div>

          <div className="absolute inset-x-4 top-20 flex items-center justify-between border-b border-dashed border-blue-500/20 pb-1 text-[10px] font-mono text-blue-400/70">
            <span>TP1 (Conservative Target)</span>
            <span>$228.60 (+1.8%)</span>
          </div>

          <div className="absolute inset-x-4 bottom-10 flex items-center justify-between border-b border-dashed border-red-500/30 pb-1 text-[10px] font-mono text-red-400/80">
            <span>Invalidation / Hard SL</span>
            <span>$221.80 (-1.2%)</span>
          </div>

          {/* SVG Glowing Signal Wave & Ascending Line */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 500 240">
            <defs>
              <linearGradient id="signalGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.0" />
                <stop offset="60%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
              </linearGradient>

              <linearGradient id="strokeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Filled area below breakout path */}
            <path
              d="M 20 180 Q 80 170, 140 160 T 260 130 T 360 85 T 480 35 L 480 240 L 20 240 Z"
              fill="url(#signalGradient)"
            />

            {/* Main Glowing Breakout Signal Line */}
            <path
              d="M 20 180 Q 80 170, 140 160 T 260 130 T 360 85 T 480 35"
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(37,99,235,0.8)]"
            />
          </svg>

          {/* Ascending Candlestick Bar Animations */}
          <div className="absolute inset-0 flex items-end justify-between px-10 pb-12 pointer-events-none">
            {[
              { h: 32, o: 15, isGreen: false },
              { h: 48, o: 20, isGreen: true },
              { h: 40, o: 30, isGreen: true },
              { h: 65, o: 45, isGreen: true },
              { h: 55, o: 60, isGreen: false },
              { h: 90, o: 75, isGreen: true },
              { h: 120, o: 100, isGreen: true },
              { h: 145, o: 125, isGreen: true },
            ].map((candle, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center group transition-transform duration-500 hover:scale-110"
                style={{
                  height: `${candle.h}px`,
                  marginBottom: `${candle.o}px`,
                }}
              >
                {/* Wick */}
                <div
                  className={`w-[1.5px] h-full ${
                    candle.isGreen ? "bg-cyan-400" : "bg-red-400"
                  } opacity-60`}
                />
                {/* Candle Body */}
                <div
                  className={`absolute top-2 bottom-2 w-3 rounded-sm ${
                    candle.isGreen
                      ? "bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                      : "bg-red-500/80"
                  } animate-pulse`}
                  style={{ animationDuration: `${2 + idx * 0.3}s` }}
                />
              </div>
            ))}
          </div>

          {/* Real-Time Live Breakout Pulse Marker */}
          <div className="absolute top-7 right-8 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div className="rounded-lg border border-cyan-500/40 bg-zinc-900/90 px-2 py-1 text-[11px] font-mono font-bold text-cyan-300 shadow-lg backdrop-blur">
              TRIGGER HIT · $234.20
            </div>
          </div>
        </div>

        {/* Floating Telemetry Micro-Badges */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 backdrop-blur text-center transition-all hover:border-blue-500/30">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Max Risk Cap</div>
            <div className="text-sm font-bold text-white font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              1.00% ($500)
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 backdrop-blur text-center transition-all hover:border-blue-500/30">
            <div className="text-[10px] uppercase font-mono text-zinc-500">R:R Ratio</div>
            <div className="text-sm font-bold text-cyan-400 font-mono flex items-center justify-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
              1 : 3.85
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 backdrop-blur text-center transition-all hover:border-blue-500/30">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Drawdown Shield</div>
            <div className="text-sm font-bold text-blue-400 font-mono flex items-center justify-center gap-1">
              <Lock className="h-3.5 w-3.5 text-blue-400" />
              Guarded
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Proof / Trust Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-zinc-800/80 pt-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["#2563eb", "#06b6d4", "#f59e0b", "#8b5cf6"].map((color, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="font-medium text-zinc-300">Used by 12,000+ prop & retail traders</span>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-medium">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>SOC2 Type II</span>
        </div>
      </div>
    </div>
  );
}
