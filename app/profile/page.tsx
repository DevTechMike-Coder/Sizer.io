import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ProfileWorkstation } from "@/components/profile/ProfileWorkstation";

export const metadata: Metadata = {
  title: "Profile & Risk Settings · Sizer.io",
  description: "Manage your account details and default risk management presets.",
};

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/auth/login?next=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { riskProfile: true },
  });

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const tradeCount = await prisma.tradeSetup.count({ where: { userId: user.id } });

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      {/* Ambient Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-gradient-to-b from-blue-500/10 via-cyan-500/5 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header Navigation */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-border/80 bg-card/60">
              <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/60" />
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Account & Risk Settings</span>
            </div>
          </div>
        </header>

        <ProfileWorkstation
          initialUser={{
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
            riskProfile: user.riskProfile
              ? {
                  defaultEquity: user.riskProfile.defaultEquity,
                  defaultRiskPercent: user.riskProfile.defaultRiskPercent,
                  defaultLeverage: user.riskProfile.defaultLeverage,
                  propFirmMode: user.riskProfile.propFirmMode,
                  maxDailyLossPercent: user.riskProfile.maxDailyLossPercent,
                }
              : null,
          }}
          tradeCount={tradeCount}
        />
      </div>
    </main>
  );
}
