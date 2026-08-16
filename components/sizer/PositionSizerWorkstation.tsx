"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Layers,
  Sliders,
  Percent,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";

export type AssetCategory = "CRYPTO" | "FOREX" | "EQUITIES" | "COMMODITIES" | "INDICES";

export interface SizerAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  defaultPrice: number;
  defaultStopDistancePercent: number;
  defaultTargetDistancePercent: number;
  lotMultiplier?: number;
  unitLabel: string;
  precision: number;
  pipSize: number;
}

export const SIZER_ASSETS: Record<string, SizerAsset> = {
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "EQUITIES",
    defaultPrice: 128.5,
    defaultStopDistancePercent: 2.5,
    defaultTargetDistancePercent: 6.5,
    unitLabel: "Shares",
    precision: 2,
    pipSize: 0.01,
  },
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "EQUITIES",
    defaultPrice: 224.5,
    defaultStopDistancePercent: 2.0,
    defaultTargetDistancePercent: 5.5,
    unitLabel: "Shares",
    precision: 2,
    pipSize: 0.01,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "EQUITIES",
    defaultPrice: 218.0,
    defaultStopDistancePercent: 3.5,
    defaultTargetDistancePercent: 9.0,
    unitLabel: "Shares",
    precision: 2,
    pipSize: 0.01,
  },
  SPY: {
    symbol: "SPY",
    name: "S&P 500 ETF",
    category: "INDICES",
    defaultPrice: 554.0,
    defaultStopDistancePercent: 1.2,
    defaultTargetDistancePercent: 3.2,
    unitLabel: "Shares / Contracts",
    precision: 2,
    pipSize: 0.01,
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ (Nasdaq)",
    category: "INDICES",
    defaultPrice: 482.0,
    defaultStopDistancePercent: 1.5,
    defaultTargetDistancePercent: 4.0,
    unitLabel: "Shares / Contracts",
    precision: 2,
    pipSize: 0.01,
  },
  "EUR/USD": {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "FOREX",
    defaultPrice: 1.085,
    defaultStopDistancePercent: 0.35,
    defaultTargetDistancePercent: 1.1,
    lotMultiplier: 100000,
    unitLabel: "Lots",
    precision: 4,
    pipSize: 0.0001,
  },
  "GBP/USD": {
    symbol: "GBP/USD",
    name: "British Pound / USD",
    category: "FOREX",
    defaultPrice: 1.295,
    defaultStopDistancePercent: 0.4,
    defaultTargetDistancePercent: 1.25,
    lotMultiplier: 100000,
    unitLabel: "Lots",
    precision: 4,
    pipSize: 0.0001,
  },
  "USD/JPY": {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    category: "FOREX",
    defaultPrice: 154.2,
    defaultStopDistancePercent: 0.5,
    defaultTargetDistancePercent: 1.4,
    lotMultiplier: 100000,
    unitLabel: "Lots",
    precision: 3,
    pipSize: 0.01,
  },
  "BTC/USD": {
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "CRYPTO",
    defaultPrice: 64250,
    defaultStopDistancePercent: 2.2,
    defaultTargetDistancePercent: 6.8,
    unitLabel: "BTC",
    precision: 2,
    pipSize: 1.0,
  },
  "ETH/USD": {
    symbol: "ETH/USD",
    name: "Ethereum",
    category: "CRYPTO",
    defaultPrice: 3450,
    defaultStopDistancePercent: 2.8,
    defaultTargetDistancePercent: 8.0,
    unitLabel: "ETH",
    precision: 2,
    pipSize: 0.1,
  },
  "SOL/USD": {
    symbol: "SOL/USD",
    name: "Solana",
    category: "CRYPTO",
    defaultPrice: 158.0,
    defaultStopDistancePercent: 3.5,
    defaultTargetDistancePercent: 10.5,
    unitLabel: "SOL",
    precision: 2,
    pipSize: 0.05,
  },
  "XAU/USD": {
    symbol: "XAU/USD",
    name: "Gold Spot",
    category: "COMMODITIES",
    defaultPrice: 2410.5,
    defaultStopDistancePercent: 0.8,
    defaultTargetDistancePercent: 2.4,
    unitLabel: "Oz / Contracts",
    precision: 2,
    pipSize: 0.1,
  },
  "WTI/USD": {
    symbol: "WTI/USD",
    name: "Crude Oil (WTI)",
    category: "COMMODITIES",
    defaultPrice: 78.5,
    defaultStopDistancePercent: 1.8,
    defaultTargetDistancePercent: 5.2,
    unitLabel: "Barrels / Contracts",
    precision: 2,
    pipSize: 0.01,
  },
};

const ACCOUNT_PRESETS = [
  { label: "$5K", value: 5000 },
  { label: "$10K", value: 10000 },
  { label: "$25K", value: 25000 },
  { label: "$50K", value: 50000 },
  { label: "$100K (Prop)", value: 100000 },
  { label: "$200K (Prop)", value: 200000 },
];

const RISK_PRESETS = [
  { label: "0.25%", value: 0.25 },
  { label: "0.50%", value: 0.5 },
  { label: "1.00%", value: 1.0 },
  { label: "1.50%", value: 1.5 },
  { label: "2.00%", value: 2.0 },
];

export function PositionSizerWorkstation() {
  const searchParams = useSearchParams();

  // Query Params Hydration
  const querySymbol = searchParams.get("symbol") || "NVDA";
  const queryPrice = searchParams.get("price") ? parseFloat(searchParams.get("price")!) : null;

  const matchedKey =
    Object.keys(SIZER_ASSETS).find(
      (k) =>
        k.toLowerCase() === querySymbol.toLowerCase() ||
        k.replace("/", "").toLowerCase() === querySymbol.replace("/", "").toLowerCase()
    ) || "NVDA";

  const [selectedSymbol, setSelectedSymbol] = useState<string>(matchedKey);
  const [accountBalance, setAccountBalance] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [leverage, setLeverage] = useState<number>(1);
  const [propFirmMode, setPropFirmMode] = useState<boolean>(true);
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState<number>(5.0);

  const activeAsset = SIZER_ASSETS[selectedSymbol] || SIZER_ASSETS.NVDA;

  // Initialize Price Levels
  const initialEntry = queryPrice || activeAsset.defaultPrice;
  const [entryPrice, setEntryPrice] = useState<number>(initialEntry);
  const [stopLoss, setStopLoss] = useState<number>(
    direction === "LONG"
      ? Number((initialEntry * (1 - activeAsset.defaultStopDistancePercent / 100)).toFixed(activeAsset.precision))
      : Number((initialEntry * (1 + activeAsset.defaultStopDistancePercent / 100)).toFixed(activeAsset.precision))
  );
  const [takeProfit, setTakeProfit] = useState<number>(
    direction === "LONG"
      ? Number((initialEntry * (1 + activeAsset.defaultTargetDistancePercent / 100)).toFixed(activeAsset.precision))
      : Number((initialEntry * (1 - activeAsset.defaultTargetDistancePercent / 100)).toFixed(activeAsset.precision))
  );

  const [copied, setCopied] = useState<boolean>(false);

  // Sync when asset selection changes
  const handleAssetSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    const asset = SIZER_ASSETS[symbol];
    if (asset) {
      const p = asset.defaultPrice;
      setEntryPrice(p);
      setStopLoss(
        direction === "LONG"
          ? Number((p * (1 - asset.defaultStopDistancePercent / 100)).toFixed(asset.precision))
          : Number((p * (1 + asset.defaultStopDistancePercent / 100)).toFixed(asset.precision))
      );
      setTakeProfit(
        direction === "LONG"
          ? Number((p * (1 + asset.defaultTargetDistancePercent / 100)).toFixed(asset.precision))
          : Number((p * (1 - asset.defaultTargetDistancePercent / 100)).toFixed(asset.precision))
      );
    }
  };

  // Flip SL / TP when toggling direction
  const handleDirectionToggle = (newDir: "LONG" | "SHORT") => {
    if (newDir === direction) return;
    setDirection(newDir);
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const targetDistance = Math.abs(takeProfit - entryPrice);

    if (newDir === "LONG") {
      setStopLoss(Number((entryPrice - stopDistance).toFixed(activeAsset.precision)));
      setTakeProfit(Number((entryPrice + targetDistance).toFixed(activeAsset.precision)));
    } else {
      setStopLoss(Number((entryPrice + stopDistance).toFixed(activeAsset.precision)));
      setTakeProfit(Number((entryPrice - targetDistance).toFixed(activeAsset.precision)));
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const riskDollar = (accountBalance * riskPercent) / 100;
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const targetDistance = Math.abs(takeProfit - entryPrice);

    const isDirectionValid =
      direction === "LONG" ? stopLoss < entryPrice && takeProfit > entryPrice : stopLoss > entryPrice && takeProfit < entryPrice;

    const isValid =
      stopDistance > 0 && entryPrice > 0 && accountBalance > 0 && isDirectionValid;

    if (!isValid) {
      return {
        isValid: false,
        riskDollar,
        units: 0,
        standardLots: 0,
        miniLots: 0,
        microLots: 0,
        positionValue: 0,
        requiredMargin: 0,
        effectiveLeverage: 0,
        riskRewardRatio: 0,
        potentialProfit: 0,
        lossPercentMove: 0,
        gainPercentMove: 0,
        pipsAtRisk: 0,
        pipsTarget: 0,
        propFirmWarning: false,
      };
    }

    // Units recommended = Risk ($) / Stop Distance ($ per unit)
    const rawUnits = riskDollar / stopDistance;
    const positionValue = rawUnits * entryPrice;
    const requiredMargin = leverage > 1 ? positionValue / leverage : positionValue;
    const effectiveLeverage = positionValue / accountBalance;
    const riskRewardRatio = targetDistance / stopDistance;
    const potentialProfit = rawUnits * targetDistance;
    const lossPercentMove = (stopDistance / entryPrice) * 100;
    const gainPercentMove = (targetDistance / entryPrice) * 100;

    const pipsAtRisk = stopDistance / activeAsset.pipSize;
    const pipsTarget = targetDistance / activeAsset.pipSize;

    // Lots Calculation (for Forex / indices)
    let standardLots = rawUnits;
    let miniLots = rawUnits;
    let microLots = rawUnits;

    if (activeAsset.lotMultiplier) {
      standardLots = rawUnits / activeAsset.lotMultiplier;
      miniLots = standardLots * 10;
      microLots = standardLots * 100;
    }

    const propFirmWarning = propFirmMode && riskPercent > maxDailyLossPercent / 2;

    return {
      isValid: true,
      riskDollar,
      units: rawUnits,
      standardLots,
      miniLots,
      microLots,
      positionValue,
      requiredMargin,
      effectiveLeverage,
      riskRewardRatio,
      potentialProfit,
      lossPercentMove,
      gainPercentMove,
      pipsAtRisk,
      pipsTarget,
      propFirmWarning,
    };
  }, [
    accountBalance,
    riskPercent,
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    activeAsset,
    leverage,
    propFirmMode,
    maxDailyLossPercent,
  ]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveTrade = async () => {
    if (!calculations.isValid) return;
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: activeAsset.symbol,
          assetName: activeAsset.name,
          category: activeAsset.category,
          direction,
          accountEquity: accountBalance,
          riskPercent,
          riskDollar: calculations.riskDollar,
          entryPrice,
          stopLoss,
          takeProfit,
          recommendedSize: calculations.units,
          unitLabel: activeAsset.unitLabel,
          lotMultiplier: activeAsset.lotMultiplier || null,
          riskRewardRatio: calculations.riskRewardRatio,
          potentialProfit: calculations.potentialProfit,
          pipsAtRisk: calculations.pipsAtRisk,
          pipsTarget: calculations.pipsTarget,
        }),
      });

      if (res.ok) {
        setSaveSuccess("Saved to Trade Journal!");
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySetup = () => {
    const text = `Sizer.io Precision Order Blueprint:
Instrument: ${activeAsset.name} (${activeAsset.symbol})
Direction: ${direction}
Account Equity: $${accountBalance.toLocaleString()}
Risk: ${riskPercent}% ($${calculations.riskDollar.toFixed(2)})
Entry Price: $${entryPrice}
Stop Loss: $${stopLoss} (-${calculations.lossPercentMove.toFixed(2)}%, ${calculations.pipsAtRisk.toFixed(1)} pips/pts)
Take Profit: $${takeProfit} (+${calculations.gainPercentMove.toFixed(2)}%, ${calculations.pipsTarget.toFixed(1)} pips/pts)
Recommended Size: ${
      activeAsset.lotMultiplier
        ? `${calculations.standardLots.toFixed(2)} Standard Lots (${calculations.units.toFixed(0)} units)`
        : `${calculations.units.toFixed(2)} ${activeAsset.unitLabel}`
    }
R:R Ratio: 1:${calculations.riskRewardRatio.toFixed(2)}
Potential Return: +$${calculations.potentialProfit.toFixed(2)}
Position Value: $${calculations.positionValue.toFixed(2)} (Effective Leverage: ${calculations.effectiveLeverage.toFixed(2)}x)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Calculator className="h-3.5 w-3.5" />
              Institutional Risk OS v2.0
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Zero Math Errors · Instant Lot Sizing
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Live Position Sizing Workstation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Input your account balance and stop loss. Sizer.io calculates exact volume, risk-to-reward ratios, and nominal margin requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 cursor-pointer">
            <Link href="/market">
              <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Open Terminal</span>
            </Link>
          </Button>

          <Button
            onClick={handleSaveTrade}
            disabled={!calculations.isValid || isSaving}
            variant="outline"
            size="sm"
            className="rounded-xl border-blue-500/40 hover:bg-blue-500/10 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">{saveSuccess}</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Save to Journal</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleCopySetup}
            size="sm"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Ticket Copied!" : "Export Order Ticket"}</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Inputs Column (7 cols) + Live Results Column (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Input Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Asset Selection & Direction */}
          <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold font-mono">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">Asset & Trade Direction</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Category: <strong className="text-foreground">{activeAsset.category}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Asset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Trading Instrument</label>
                <Select value={selectedSymbol} onValueChange={handleAssetSelect}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-background/80 border-border/80 text-xs font-bold">
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {["EQUITIES", "FOREX", "CRYPTO", "COMMODITIES", "INDICES"].map((category) => (
                      <SelectGroup key={category}>
                        <SelectLabel className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                          {category}
                        </SelectLabel>
                        {Object.values(SIZER_ASSETS)
                          .filter((a) => a.category === category)
                          .map((asset) => (
                            <SelectItem key={asset.symbol} value={asset.symbol} className="text-xs cursor-pointer">
                              <span className="font-bold">{asset.symbol}</span> · {asset.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Long / Short Direction Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Position Bias</label>
                <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl bg-muted/40 border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleDirectionToggle("LONG")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      direction === "LONG"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>LONG / BUY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectionToggle("SHORT")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      direction === "SHORT"
                        ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>SHORT / SELL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Account Balance & Risk Tolerance */}
          <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold font-mono">
                  2
                </span>
                <h2 className="text-sm font-bold text-foreground">Capital & Risk Parameters</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono font-bold">
                <span>Calculated Risk:</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5">${calculations.riskDollar.toFixed(2)}</span>
              </div>
            </div>

            {/* Account Balance Input + Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Total Account Equity ($ USD)</label>
                <div className="flex items-center gap-1">
                  {ACCOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setAccountBalance(preset.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        accountBalance === preset.value
                          ? "bg-emerald-500 text-white"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  step={100}
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="h-10 rounded-xl pl-9 font-mono font-bold text-sm bg-background/80"
                />
              </div>
            </div>

            {/* Risk Percentage Input + Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Risk Percentage Per Trade (%)</label>
                <div className="flex items-center gap-1">
                  {RISK_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setRiskPercent(preset.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        riskPercent === preset.value
                          ? "bg-emerald-500 text-white"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={0.05}
                  max={20}
                  step={0.1}
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="h-10 rounded-xl pl-9 font-mono font-bold text-sm bg-background/80"
                />
              </div>
            </div>

            {/* Prop Firm Drawdown Shield Option */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Prop Firm Drawdown Shield</span>
                    <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] text-emerald-400 font-mono">
                      FTMO / Topstep
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Warns if single trade risk exceeds 50% of maximum daily loss limit.
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={propFirmMode}
                onChange={(e) => setPropFirmMode(e.target.checked)}
                className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Card 3: Technical Price Levels (Entry, SL, TP) */}
          <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold font-mono">
                  3
                </span>
                <h2 className="text-sm font-bold text-foreground">Technical Invalidation & Target Levels</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Precision: <strong>{activeAsset.precision} decimals</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Entry Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Planned Entry ($)</span>
                </label>
                <Input
                  type="number"
                  step={activeAsset.pipSize}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="h-10 rounded-xl font-mono font-bold text-sm bg-background/80"
                />
              </div>

              {/* Stop Loss */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-red-400 flex items-center justify-between">
                  <span>Stop Loss ($)</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {calculations.lossPercentMove > 0 ? `-${calculations.lossPercentMove.toFixed(2)}%` : ""}
                  </span>
                </label>
                <Input
                  type="number"
                  step={activeAsset.pipSize}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="h-10 rounded-xl font-mono font-bold text-sm bg-background/80 border-red-500/40 focus-visible:border-red-500"
                />
              </div>

              {/* Take Profit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                  <span>Take Profit ($)</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {calculations.gainPercentMove > 0 ? `+${calculations.gainPercentMove.toFixed(2)}%` : ""}
                  </span>
                </label>
                <Input
                  type="number"
                  step={activeAsset.pipSize}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="h-10 rounded-xl font-mono font-bold text-sm bg-background/80 border-emerald-500/40 focus-visible:border-emerald-500"
                />
              </div>
            </div>

            {/* Validation Alerts */}
            {!calculations.isValid && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {direction === "LONG"
                    ? "Invalid LONG setup: Stop Loss must be BELOW entry price, and Take Profit must be ABOVE entry price."
                    : "Invalid SHORT setup: Stop Loss must be ABOVE entry price, and Take Profit must be BELOW entry price."}
                </span>
              </div>
            )}

            {calculations.propFirmWarning && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>
                  Warning: Risking {riskPercent}% on a single trade violates standard prop firm drawdown discipline rules (max recommended: 1.0% per trade).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Institutional Output Blueprint (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-zinc-950 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-zinc-100 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Order Blueprint</div>
                <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <span>{activeAsset.symbol}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      direction === "LONG" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {direction}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Max Dollar Risk</div>
                <div className="text-lg font-black text-red-400 font-mono">-${calculations.riskDollar.toFixed(2)}</div>
              </div>
            </div>

            {/* Primary Recommended Size Hero Box */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 mb-6 text-center">
              <div className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold mb-1">
                Recommended Order Size
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {activeAsset.lotMultiplier
                  ? `${calculations.standardLots.toFixed(2)} Lots`
                  : `${calculations.units.toFixed(2)} ${activeAsset.unitLabel}`}
              </div>

              {activeAsset.lotMultiplier && (
                <div className="mt-2 flex items-center justify-center gap-3 text-xs font-mono text-zinc-400">
                  <span>Mini: <strong className="text-zinc-200">{calculations.miniLots.toFixed(1)}</strong></span>
                  <span>•</span>
                  <span>Micro: <strong className="text-zinc-200">{calculations.microLots.toFixed(0)}</strong></span>
                  <span>•</span>
                  <span>Units: <strong className="text-zinc-200">{calculations.units.toFixed(0)}</strong></span>
                </div>
              )}
            </div>

            {/* Risk to Reward Visualizer */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Risk-to-Reward Ratio</span>
                <span
                  className={`font-black text-sm ${
                    calculations.riskRewardRatio >= 2
                      ? "text-emerald-400"
                      : calculations.riskRewardRatio >= 1.5
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  1 : {calculations.riskRewardRatio.toFixed(2)}
                </span>
              </div>

              {/* R:R Ratio Distribution Bar */}
              <div className="h-3 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
                <div className="h-full bg-red-500/80 transition-all duration-300" style={{ width: "25%" }} />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(75, Math.max(10, (calculations.riskRewardRatio / (1 + calculations.riskRewardRatio)) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-red-400">Downside: -${calculations.riskDollar.toFixed(2)} (-{calculations.lossPercentMove.toFixed(2)}%)</span>
                <span className="text-emerald-400">Target: +${calculations.potentialProfit.toFixed(2)} (+{calculations.gainPercentMove.toFixed(2)}%)</span>
              </div>
            </div>

            {/* Secondary Technical Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-zinc-500 text-[10px] uppercase">Nominal Trade Value</div>
                <div className="text-white font-bold text-sm mt-0.5">${calculations.positionValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-zinc-500 text-[10px] uppercase">Effective Leverage</div>
                <div className="text-white font-bold text-sm mt-0.5">{calculations.effectiveLeverage.toFixed(2)}x Account</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-zinc-500 text-[10px] uppercase">Pips / Points at Risk</div>
                <div className="text-red-400 font-bold text-sm mt-0.5">{calculations.pipsAtRisk.toFixed(1)} pts</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-zinc-500 text-[10px] uppercase">Pips / Points Target</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{calculations.pipsTarget.toFixed(1)} pts</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleCopySetup}
                disabled={!calculations.isValid}
                size="lg"
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.01] cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Trade Parameters Copied!" : "Copy Order Ticket"}</span>
              </Button>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Non-Custodial Calculation
                </span>
                <Link href="/market" className="hover:text-zinc-300 transition flex items-center gap-1">
                  <span>View Live Chart</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
