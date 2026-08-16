import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPendingOtpChallenge, OTP_COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

const OAUTH_STATE_COOKIE = "sizer_oauth_state";
// Carries the OTP code briefly so the client can display it without it
// ever appearing in the URL (browser history, Referer header, server logs).
const OAUTH_DISPLAY_COOKIE = "sizer_oauth_display";

type OAuthProvider = "google" | "github";

type OAuthProfile = {
  email: string;
  name: string | null;
};

type GitHubEmail = {
  email?: string;
  primary?: boolean;
  verified?: boolean;
};

function getErrorRedirect(req: NextRequest, message: string) {
  const url = new URL("/auth/login", req.nextUrl.origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

async function exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) throw new Error("Google token exchange failed.");
  const tokenData = await tokenRes.json();

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) throw new Error("Google profile lookup failed.");
  const profile = await profileRes.json();

  if (!profile.email) throw new Error("Google account did not return an email address.");
  return { email: String(profile.email).toLowerCase().trim(), name: profile.name || null };
}

async function exchangeGitHubCode(code: string, redirectUri: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) throw new Error("GitHub token exchange failed.");
  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userRes.ok) throw new Error("GitHub profile lookup failed.");
  const githubUser = await userRes.json();
  let email = githubUser.email;

  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!emailsRes.ok) throw new Error("GitHub email lookup failed.");
    const emails = (await emailsRes.json()) as GitHubEmail[];
    email = emails.find((item) => item.primary && item.verified)?.email || emails.find((item) => item.verified)?.email;
  }

  if (!email) throw new Error("GitHub account did not return a verified email address.");
  return { email: String(email).toLowerCase().trim(), name: githubUser.name || githubUser.login || null };
}

async function findOrCreateOAuthUser(profile: OAuthProfile, provider: OAuthProvider) {
  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { riskProfile: true },
  });

  if (existingUser) return existingUser;

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      passwordHash: `oauth:${provider}:${randomUUID()}`,
      riskProfile: {
        create: {
          defaultEquity: 50000,
          defaultRiskPercent: 1.0,
          defaultLeverage: 1.0,
          propFirmMode: true,
          maxDailyLossPercent: 5.0,
        },
      },
    },
    include: { riskProfile: true },
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (provider !== "google" && provider !== "github") {
    return getErrorRedirect(req, "Unsupported OAuth provider.");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return getErrorRedirect(req, "OAuth verification failed. Please try again.");
  }

  if (!process.env[`${provider.toUpperCase()}_CLIENT_ID`] || !process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]) {
    return getErrorRedirect(req, `${provider} OAuth is not configured.`);
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/${provider}/callback`;
    const oauthProvider = provider as OAuthProvider;
    const profile = oauthProvider === "google" ? await exchangeGoogleCode(code, redirectUri) : await exchangeGitHubCode(code, redirectUri);
    const user = await findOrCreateOAuthUser(profile, oauthProvider);
    const challenge = await createPendingOtpChallenge({ userId: user.id, email: user.email, name: user.name });

    // Send email verification to the OAuth account email
    await sendVerificationEmail({
      to: user.email,
      code: challenge.code,
      name: user.name,
    });

    const redirectUrl = new URL("/auth/login", req.nextUrl.origin);
    redirectUrl.searchParams.set("otp", "1");

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set({
      name: OTP_COOKIE_NAME,
      value: challenge.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });
    // Short-lived, non-httpOnly: the client reads this once to show the OTP
    // to the user, then deletes it immediately. Never touches the URL.
    response.cookies.set({
      name: OAUTH_DISPLAY_COOKIE,
      value: JSON.stringify({ email: user.email, code: challenge.code }),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30,
      path: "/",
    });
    response.cookies.set({
      name: OAUTH_STATE_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error(`${provider} OAuth callback error:`, error);
    return getErrorRedirect(req, error instanceof Error ? error.message : "OAuth authentication failed.");
  }
}

