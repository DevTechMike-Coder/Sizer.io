"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Save,
  Check,
  AlertTriangle,
  Shield,
  TrendingUp,
  Zap,
  ListChecks,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RiskProfile {
  defaultEquity: number;
  defaultRiskPercent: number;
  defaultLeverage: number;
  propFirmMode: boolean;
  maxDailyLossPercent: number;
}

interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  riskProfile: RiskProfile | null;
}

const DEFAULT_RISK: RiskProfile = {
  defaultEquity: 50000,
  defaultRiskPercent: 1.0,
  defaultLeverage: 1.0,
  propFirmMode: true,
  maxDailyLossPercent: 5.0,
};

export function ProfileWorkstation({
  initialUser,
  tradeCount,
}: {
  initialUser: ProfileUser;
  tradeCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name || "");
  const [risk, setRisk] = useState<RiskProfile>(initialUser.riskProfile || DEFAULT_RISK);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = (initialUser.name || initialUser.email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const memberSince = new Date(initialUser.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          defaultEquity: risk.defaultEquity,
          defaultRiskPercent: risk.defaultRiskPercent,
          defaultLeverage: risk.defaultLeverage,
          propFirmMode: risk.propFirmMode,
          maxDailyLossPercent: risk.maxDailyLossPercent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes.");
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Identity Card */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-xl font-black text-white shadow-lg shadow-blue-500/25">
              {initials}
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground truncate max-w-full">
              {initialUser.name || "Unnamed Trader"}
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-full">{initialUser.email}</p>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-border/40 pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Member Since
              </span>
              <span className="font-semibold text-foreground">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" />
                Saved Trade Setups
              </span>
              <span className="font-semibold text-foreground">{tradeCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Account Security
              </span>
              <span className="font-semibold text-emerald-500">Session Active</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-border/80 bg-background/60 text-xs font-semibold">
              <Link href="/sizer" className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Sizer
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                {loggingOut ? "Signing Out…" : "Log Out"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Editable Settings */}
      <div className="lg:col-span-8 space-y-6">
        {/* Display Name */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <User className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">Account Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="text-sm font-semibold bg-background/80"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={initialUser.email}
                  disabled
                  className="pl-8 text-sm font-semibold bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Profile Defaults */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <Shield className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Default Risk Presets</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5 -mt-2">
            These defaults pre-fill the Position Sizer every time you start a new calculation.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Default Account Equity ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                <Input
                  type="number"
                  min={100}
                  value={risk.defaultEquity}
                  onChange={(e) => setRisk((r) => ({ ...r, defaultEquity: Number(e.target.value) }))}
                  className="pl-7 text-xs font-semibold font-mono bg-background/80"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Default Risk Per Trade (%)
              </label>
              <Input
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                value={risk.defaultRiskPercent}
                onChange={(e) => setRisk((r) => ({ ...r, defaultRiskPercent: Number(e.target.value) }))}
                className="text-xs font-semibold font-mono bg-background/80"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Default Leverage (x)
              </label>
              <Input
                type="number"
                min={1}
                max={500}
                step={0.5}
                value={risk.defaultLeverage}
                onChange={(e) => setRisk((r) => ({ ...r, defaultLeverage: Number(e.target.value) }))}
                className="text-xs font-semibold font-mono bg-background/80"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Max Daily Loss (%)
              </label>
              <Input
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                value={risk.maxDailyLossPercent}
                onChange={(e) => setRisk((r) => ({ ...r, maxDailyLossPercent: Number(e.target.value) }))}
                className="text-xs font-semibold font-mono bg-background/80"
              />
            </div>
          </div>

          {/* Prop Firm Mode Toggle */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border/40 bg-background/40 p-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-foreground">Prop Firm Mode</div>
                <div className="text-[11px] text-muted-foreground">Enforce daily loss & trailing drawdown limits</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRisk((r) => ({ ...r, propFirmMode: !r.propFirmMode }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                risk.propFirmMode ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
              aria-pressed={risk.propFirmMode}
              aria-label="Toggle Prop Firm Mode"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  risk.propFirmMode ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.01] cursor-pointer disabled:opacity-60 w-full sm:w-auto"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
