import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthVisualHero } from "@/components/auth/AuthVisualHero";

export const metadata: Metadata = {
  title: "Login · Sizer.io | Institutional Risk OS",
  description: "Sign in to your Sizer.io terminal to access precise risk sizing and drawdown tools.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl border border-border/60 bg-card/40 p-4 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Left Side: Auth Form */}
        <div className="w-full flex items-center justify-center">
          <AuthForm initialMode="login" />
        </div>

        {/* Right Side: Animated Trading Signal Visual Hero */}
        <div className="w-full h-full flex items-center justify-center">
          <AuthVisualHero />
        </div>
      </div>
    </main>
  );
}
