"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  DollarSign,
} from "lucide-react";
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

type AssetType = "CRYPTO" | "FOREX" | "STOCKS" | "INDICES";

interface AssetPreset {
  name: string;
  type: AssetType;
  defaultEntry: number;
  defaultStop: number;
  defaultTarget: number;
  step: number;
  unitLabel: string;
  lotMultiplier?: number;
}

const PRESETS: Record<string, AssetPreset> = {
  BTCUSD: {
    name: "Bitcoin (BTC/USD)",
    type: "CRYPTO",
    defaultEntry: 64250,
    defaultStop: 62800,
    defaultTarget: 68600,
    step: 10,
    unitLabel: "BTC",
  },
  ETHUSD: {
    name: "Ethereum (ETH/USD)",
    type: "CRYPTO",
    defaultEntry: 3450,
    defaultStop: 3380,
    defaultTarget: 3680,
    step: 1,
    unitLabel: "ETH",
  },
  EURUSD: {
    name: "EUR/USD (Forex)",
    type: "FOREX",
    defaultEntry: 1.085,
    defaultStop: 1.0815,
    defaultTarget: 1.0955,
    step: 0.0001,
    unitLabel: "Lots (Standard)",
    lotMultiplier: 100000,
  },
  GBPUSD: {
    name: "GBP/USD (Forex)",
    type: "FOREX",
    defaultEntry: 1.295,
    defaultStop: 1.289,
    defaultTarget: 1.312,
    step: 0.0001,
    unitLabel: "Lots (Standard)",
    lotMultiplier: 100000,
  },
  XAUUSD: {
    name: "Gold (XAU/USD)",
    type: "INDICES",
    defaultEntry: 2410.5,
    defaultStop: 2392.0,
    defaultTarget: 2465.0,
    step: 0.5,
    unitLabel: "Oz / Contracts",
  },
  NVDA: {
    name: "NVIDIA (NVDA)",
    type: "STOCKS",
    defaultEntry: 128.5,
    defaultStop: 122.0,
    defaultTarget: 148.0,
    step: 0.1,
    unitLabel: "Shares",
  },
  AAPL: {
    name: "Apple (AAPL)",
    type: "STOCKS",
    defaultEntry: 224.0,
    defaultStop: 218.5,
    defaultTarget: 239.0,
    step: 0.1,
    unitLabel: "Shares",
  },
  SPX: {
    name: "S&P 500 (SPX)",
    type: "INDICES",
    defaultEntry: 5540,
    defaultStop: 5490,
    defaultTarget: 5690,
    step: 1,
    unitLabel: "Contracts",
  },
};

export function InteractivePositionSizer() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSD");
  const [accountBalance, setAccountBalance] = useState<number>(25000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [entryPrice, setEntryPrice] = useState<number>(PRESETS.BTCUSD.defaultEntry);
  const [stopLoss, setStopLoss] = useState<number>(PRESETS.BTCUSD.defaultStop);
  const [takeProfit, setTakeProfit] = useState<number>(PRESETS.BTCUSD.defaultTarget);
  const [copied, setCopied] = useState<boolean>(false);

  const currentPreset = PRESETS[selectedAsset] || PRESETS.BTCUSD;

  const handleAssetChange = (assetKey: string) => {
    setSelectedAsset(assetKey);
    const preset = PRESETS[assetKey];
    if (preset) {
      setEntryPrice(preset.defaultEntry);
      setStopLoss(preset.defaultStop);
      setTakeProfit(preset.defaultTarget);
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const riskDollar = (accountBalance * riskPercent) / 100;
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const targetDistance = Math.abs(takeProfit - entryPrice);

    const isInvalid =
      stopDistance <= 0 ||
      entryPrice <= 0 ||
      accountBalance <= 0 ||
      (direction === "LONG" && stopLoss >= entryPrice) ||
      (direction === "SHORT" && stopLoss <= entryPrice);

    if (isInvalid) {
      return {
        isValid: false,
        riskDollar,
        units: 0,
        positionValue: 0,
        riskRewardRatio: 0,
        potentialProfit: 0,
        lossPercentMove: 0,
        gainPercentMove: 0,
      };
    }

    // Units recommended = Risk ($) / Stop Distance ($ per unit)
    const rawUnits = riskDollar / stopDistance;
    let units = rawUnits;

    if (currentPreset.lotMultiplier) {
      // For Forex: Units / 100,000 to get standard lots
      units = rawUnits / currentPreset.lotMultiplier;
    }

    const positionValue = rawUnits * entryPrice;
    const riskRewardRatio = targetDistance / stopDistance;
    const potentialProfit = rawUnits * targetDistance;
    const lossPercentMove = (stopDistance / entryPrice) * 100;
    const gainPercentMove = (targetDistance / entryPrice) * 100;

    return {
      isValid: true,
      riskDollar,
      units,
      rawUnits,
      positionValue,
      riskRewardRatio,
      potentialProfit,
      lossPercentMove,
      gainPercentMove,
    };
  }, [accountBalance, riskPercent, direction, entryPrice, stopLoss, takeProfit, currentPreset]);

  const handleCopy = () => {
    const text = `Sizer.io Trade Setup:\nAsset: ${currentPreset.name}\nDirection: ${direction}\nAccount: $${accountBalance.toLocaleString()}\nRisk: ${riskPercent}% ($${calculations.riskDollar.toFixed(2)})\nEntry: $${entryPrice}\nStop Loss: $${stopLoss} (-${calculations.lossPercentMove.toFixed(2)}%)\nTake Profit: $${takeProfit} (+${calculations.gainPercentMove.toFixed(2)}%)\nRecommended Size: ${calculations.units.toFixed(4)} ${currentPreset.unitLabel}\nR:R Ratio: 1:${calculations.riskRewardRatio.toFixed(2)}\nPotential Profit: +$${calculations.potentialProfit.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sizer" className="relative scroll-mt-20 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            <Calculator className="h-3.5 w-3.5" />
            <span>Interactive Risk Engine</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Demo Trade Position Sizer
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Test our core calculation model instantly. Calculate precise lot sizes and risk-to-reward metrics
            before risking capital on live markets.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Controls & Inputs (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl backdrop-blur-xl">
            {/* Asset Selector Header & Select Dropdown */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Instrument
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Choose a market pair or stock
                </span>
              </div>

              {/* shadcn Select for Asset Preset */}
              <div className="w-full sm:w-60">
                <Select value={selectedAsset} onValueChange={handleAssetChange}>
                  <SelectTrigger className="w-full bg-background/80 text-xs font-semibold">
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Crypto</SelectLabel>
                      <SelectItem value="BTCUSD">Bitcoin (BTC/USD)</SelectItem>
                      <SelectItem value="ETHUSD">Ethereum (ETH/USD)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Forex</SelectLabel>
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Commodities & Indices</SelectLabel>
                      <SelectItem value="XAUUSD">Gold (XAU/USD)</SelectItem>
                      <SelectItem value="SPX">S&P 500 (SPX)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Stocks</SelectLabel>
                      <SelectItem value="NVDA">NVIDIA (NVDA)</SelectItem>
                      <SelectItem value="AAPL">Apple (AAPL)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Asset Chips */}
            <div className="mb-6 flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleAssetChange(key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedAsset === key
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]"
                      : "border border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Direction Toggle & Account Balance Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              {/* Direction (Long / Short) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Trade Direction
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDirection("LONG");
                      if (stopLoss >= entryPrice) {
                        setStopLoss(entryPrice * 0.98);
                        setTakeProfit(entryPrice * 1.05);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      direction === "LONG"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    LONG (Buy)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDirection("SHORT");
                      if (stopLoss <= entryPrice) {
                        setStopLoss(entryPrice * 1.02);
                        setTakeProfit(entryPrice * 0.95);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      direction === "SHORT"
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    SHORT (Sell)
                  </button>
                </div>
              </div>

              {/* Account Balance using shadcn Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Account Equity ($)
                  </label>
                  <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                    ${accountBalance.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-muted-foreground font-mono pointer-events-none z-10">$</span>
                  <Input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Math.max(100, Number(e.target.value)))}
                    className="pl-7 text-xs font-semibold font-mono bg-background/80"
                  />
                </div>
              </div>
            </div>

            {/* Quick Balance Presets */}
            <div className="mb-6 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">Presets:</span>
              {[5000, 10000, 25000, 50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAccountBalance(amt)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-medium transition cursor-pointer ${
                    accountBalance === amt
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-500"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>

            {/* Risk Percentage Slider & Input */}
            <div className="mb-6 rounded-xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Risk Per Trade (% of Equity)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-foreground bg-card border border-border px-2 py-0.5 rounded-md">
                    {riskPercent}% = ${( (accountBalance * riskPercent) / 100 ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0.25"
                max="5.0"
                step="0.25"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              {/* Quick Risk Buttons */}
              <div className="mt-3 flex items-center justify-between text-xs">
                {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRiskPercent(val)}
                    className={`rounded-md px-2 py-0.5 font-mono text-[11px] transition cursor-pointer ${
                      riskPercent === val
                        ? "bg-emerald-500 text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Levels using shadcn Input (Entry, Stop Loss, Take Profit) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Entry Price */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Entry Price ($)
                </label>
                <Input
                  type="number"
                  step={currentPreset.step}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="text-xs font-semibold font-mono bg-background/80"
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-1.5 flex items-center justify-between">
                  <span>Stop Loss ($)</span>
                  <span className="text-[10px] font-mono">
                    {calculations.isValid ? `-${calculations.lossPercentMove.toFixed(2)}%` : ""}
                  </span>
                </label>
                <Input
                  type="number"
                  step={currentPreset.step}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="text-xs font-semibold font-mono bg-background/80 border-red-500/30 text-red-400 focus-visible:border-red-500"
                />
              </div>

              {/* Take Profit */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 flex items-center justify-between">
                  <span>Take Profit ($)</span>
                  <span className="text-[10px] font-mono">
                    {calculations.isValid ? `+${calculations.gainPercentMove.toFixed(2)}%` : ""}
                  </span>
                </label>
                <Input
                  type="number"
                  step={currentPreset.step}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="text-xs font-semibold font-mono bg-background/80 border-emerald-500/30 text-emerald-400 focus-visible:border-emerald-500"
                />
              </div>
            </div>

            {!calculations.isValid && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Invalid trade parameters: Stop Loss must be {direction === "LONG" ? "below" : "above"} Entry
                  Price for a {direction} trade.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Calculated Results & Sizing Blueprint (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-background p-6 shadow-2xl backdrop-blur-xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Sizing Blueprint</h3>
                    <p className="text-[11px] text-muted-foreground">Institutional Risk Breakdown</p>
                  </div>
                </div>

                <div
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold font-mono ${
                    calculations.riskRewardRatio >= 2
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : calculations.riskRewardRatio >= 1.5
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {calculations.isValid
                    ? `1 : ${calculations.riskRewardRatio.toFixed(2)} R:R`
                    : "0.00 R:R"}
                </div>
              </div>

              {/* Primary Recommended Sizing Box */}
              <div className="my-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Recommended Position Size
                </span>
                <div className="mt-1 flex items-baseline justify-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-500">
                    {calculations.isValid
                      ? calculations.units < 1
                        ? calculations.units.toFixed(4)
                        : calculations.units.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : "0.00"}
                  </span>
                  <span className="text-sm font-bold text-foreground font-sans">
                    {currentPreset.unitLabel}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono mt-1 block">
                  Position Notional: ${calculations.positionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Key Metrics List */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-2.5">
                  <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-red-400" /> Max Risk Amount
                  </span>
                  <span className="font-bold text-red-400">
                    -${calculations.riskDollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-2.5">
                  <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Profit Target
                  </span>
                  <span className="font-bold text-emerald-400">
                    +${calculations.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-2.5">
                  <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-blue-400" /> Max Drawdown Risk
                  </span>
                  <span className="font-bold text-foreground">
                    {riskPercent.toFixed(2)}% of Account
                  </span>
                </div>
              </div>

              {/* Risk vs Reward Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                  <span className="text-red-400">Risk: 1.0</span>
                  <span className="text-emerald-400">
                    Reward: {calculations.isValid ? calculations.riskRewardRatio.toFixed(2) : "0"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="bg-red-500 h-full transition-all"
                    style={{
                      width: `${Math.min(
                        50,
                        (1 / (1 + (calculations.riskRewardRatio || 1))) * 100
                      )}%`,
                    }}
                  />
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{
                      width: `${Math.max(
                        50,
                        ((calculations.riskRewardRatio || 1) /
                          (1 + (calculations.riskRewardRatio || 1))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-2">
              <button
                onClick={handleCopy}
                disabled={!calculations.isValid}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-xs font-bold text-background transition hover:bg-foreground/90 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Copied Trade Setup!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Trade Parameters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
