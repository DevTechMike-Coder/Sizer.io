"use client";

import Link from "next/link";
import { Shield, TrendingUp, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/90 text-muted-foreground text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-foreground uppercase">
                Sizer<span className="text-emerald-500">.io</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Institutional-grade risk management and position sizing platform
              for Forex, Crypto, Indices, and Equities. Designed to protect
              trader capital and eliminate ruin risk.
            </p>
            <div className="text-[11px] text-muted-foreground/80 font-mono">
              © {new Date().getFullYear()} Sizer.io / RiskTrade. All rights
              reserved.
            </div>
          </div>

          {/* Col 1: Platform */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#sizer"
                  className="hover:text-foreground transition-colors"
                >
                  Position Sizer
                </Link>
              </li>
              <li>
                <Link
                  href="#markets"
                  className="hover:text-foreground transition-colors"
                >
                  Multi-Asset Terminal
                </Link>
              </li>
              <li>
                <Link
                  href="#markets"
                  className="hover:text-foreground transition-colors"
                >
                  Sector Heatmap
                </Link>
              </li>
              <li>
                <Link
                  href="#markets"
                  className="hover:text-foreground transition-colors"
                >
                  Crypto Market Cap
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Calculators & Tools */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              Calculators
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#sizer"
                  className="hover:text-foreground transition-colors"
                >
                  Forex Lot Sizer
                </Link>
              </li>
              <li>
                <Link
                  href="#sizer"
                  className="hover:text-foreground transition-colors"
                >
                  Crypto Risk Sizer
                </Link>
              </li>
              <li>
                <Link
                  href="#sizer"
                  className="hover:text-foreground transition-colors"
                >
                  Risk-to-Reward Modeler
                </Link>
              </li>
              <li>
                <Link
                  href="#sizer"
                  className="hover:text-foreground transition-colors"
                >
                  Prop Firm Drawdown Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Account & Auth */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="hover:text-foreground transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Risk Disclaimer */}
        <div className="mt-12 border-t border-border/40 pt-6 text-[11px] text-muted-foreground/70 leading-relaxed space-y-2">
          <p>
            <strong>Risk Warning:</strong> Trading foreign exchange,
            cryptocurrencies, stocks, and derivatives on margin carries a high
            level of risk and may not be suitable for all investors. The high
            degree of leverage can work against you as well as for you. Before
            deciding to trade, you should carefully consider your investment
            objectives, level of experience, and risk appetite. Sizer.io
            provides mathematical calculation tools and market data for
            informational purposes only and does not provide financial or
            investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
