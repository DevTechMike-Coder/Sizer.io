"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthFormProps {
  initialMode: "login" | "signup";
}

type AuthStep = "credentials" | "otp";

export function AuthForm({ initialMode }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpCode, setOtpCode] = useState("");
  const [displayOtpCode, setDisplayOtpCode] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    const oauthOtp = params.get("otp");

    if (oauthError || oauthOtp === "1") {
      queueMicrotask(() => {
        if (oauthError) {
          setErrorMessage(oauthError);
        }

        if (oauthOtp === "1") {
          const displayCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("sizer_oauth_display="));

          if (displayCookie) {
            try {
              const raw = decodeURIComponent(displayCookie.split("=").slice(1).join("="));
              const { email: oauthEmail, code: oauthCode } = JSON.parse(raw);
              setMode("login");
              setStep("otp");
              setEmail(oauthEmail);
              setPendingEmail(oauthEmail);
              setDisplayOtpCode(oauthCode);
              setResendCooldown(30);
              setSuccessMessage(`A verification code was sent to ${oauthEmail}.`);
            } catch {
              setErrorMessage("OAuth sign-in confirmation could not be read. Please try again.");
            }
            // One-time read: expire it immediately so it doesn't linger in the browser.
            document.cookie = "sizer_oauth_display=; Max-Age=0; path=/;";
          } else {
            setErrorMessage("OAuth sign-in confirmation expired. Please try again.");
          }
        }
      });

      router.replace("/auth/login");
    }
  }, [router]);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setStep("credentials");
    setOtpCode("");
    setDisplayOtpCode(null);
    setPendingEmail("");
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      if (!agreeTerms) {
        setErrorMessage("You must agree to the Terms of Service & Risk Disclosure.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login" ? { email, password } : { email, password, name: fullName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed.");
        return;
      }

      if (data.verificationRequired) {
        setStep("otp");
        const targetEmail = data.user?.email || email;
        setPendingEmail(targetEmail);
        setDisplayOtpCode(data.otpDevCode || null);
        setOtpCode("");
        setResendCooldown(30);
        setSuccessMessage(`A 6-digit verification code has been sent to ${targetEmail}.`);
        return;
      }

      router.push("/market");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!/^\d{6}$/.test(otpCode)) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Verification failed.");
        return;
      }

      setSuccessMessage("Account verified. Redirecting to Terminal...");
      setTimeout(() => router.push("/market"), 500);
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    resetMessages();
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to resend code.");
        return;
      }

      setSuccessMessage(data.message || `A new verification code was sent to your email.`);
      if (data.otpDevCode) {
        setDisplayOtpCode(data.otpDevCode);
      }
      setResendCooldown(30);
    } catch {
      setErrorMessage("Network error while requesting a new code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    setIsLoading(true);
    resetMessages();
    router.push(`/api/auth/oauth/${provider}`);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Shield className="h-5 w-5 text-blue-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-foreground uppercase">
              Sizer<span className="text-blue-500">.io</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-1">Institutional Risk OS</span>
          </div>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {step === "otp" ? "Verify your email" : mode === "login" ? "Welcome back, Trader" : "Create your Risk Account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "otp"
            ? `Enter the 6-digit code sent to ${pendingEmail || email}.`
            : mode === "login"
              ? "Enter your credentials to access your live terminal and position calculations."
              : "Join thousands of funded and retail traders mastering precision risk sizing."}
        </p>
      </div>

      {step === "credentials" && (
        <div className="mb-6 flex rounded-xl border border-border/70 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up Free
          </button>
        </div>
      )}

      {step === "credentials" && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("google")}
              disabled={isLoading}
              className="h-10 rounded-xl border-border/80 bg-background/80 hover:bg-muted/70 text-xs font-semibold gap-2 shadow-sm transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("github")}
              disabled={isLoading}
              className="h-10 rounded-xl border-border/80 bg-background/80 hover:bg-muted/70 text-xs font-semibold gap-2 shadow-sm transition cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </Button>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-background px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              or continue with email
            </span>
          </div>
        </>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-500 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-xs text-blue-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {displayOtpCode && step === "otp" && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300">
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span>Dev verification code</span>
          </span>
          <span className="font-mono text-base font-bold tracking-[0.35em] text-cyan-100">{displayOtpCode}</span>
        </div>
      )}

      {step === "otp" ? (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} disabled={isLoading}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} className="size-11 text-base font-bold" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or resend.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying code...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>Verify & Continue</span>
              </div>
            )}
          </Button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isResending || isLoading}
            >
              {isResending ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Resending...</span>
                </div>
              ) : resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Resend Code</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => switchMode(mode)}
              disabled={isLoading}
            >
              Use different email
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 rounded-xl pl-9 bg-background/70 border-border/80 focus-visible:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="trader@sizer.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl pl-9 bg-background/70 border-border/80 focus-visible:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
              {mode === "login" && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset instructions will be sent to your email.");
                  }}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl pl-9 pr-10 bg-background/70 border-border/80 focus-visible:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl pl-9 bg-background/70 border-border/80 focus-visible:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {mode === "login" ? (
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-blue-600 focus:ring-blue-500/20"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>
          ) : (
            <div className="py-1">
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500/20"
                  required
                />
                <span>
                  I agree to the <span className="text-foreground font-semibold underline">Terms of Service</span> and acknowledge the financial risk disclaimer.
                </span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>{mode === "login" ? "Sign In to Terminal" : "Create Free Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-500" />
          <span>256-Bit Bank-Grade SSL & Non-Custodial Architecture</span>
        </p>
      </div>
    </div>
  );
}
