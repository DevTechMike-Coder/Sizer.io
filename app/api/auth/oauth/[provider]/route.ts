import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const OAUTH_STATE_COOKIE = "sizer_oauth_state";


function getProviderConfig(provider: string, origin: string) {
  const redirectUri = `${origin}/api/auth/oauth/${provider}/callback`;

  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
      },
    };
  }

  if (provider === "github") {
    return {
      clientId: process.env.GITHUB_CLIENT_ID,
      authorizeUrl: "https://github.com/login/oauth/authorize",
      params: {
        client_id: process.env.GITHUB_CLIENT_ID || "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "read:user user:email",
        allow_signup: "true",
      },
    };
  }

  return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const config = getProviderConfig(provider, req.nextUrl.origin);

  if (!config) {
    return NextResponse.json({ error: "Unsupported OAuth provider." }, { status: 404 });
  }

  if (!config.clientId) {
    return NextResponse.json(
      { error: `${provider.toUpperCase()} OAuth client ID is not configured.` },
      { status: 500 }
    );
  }

  const state = randomBytes(24).toString("hex");
  const authorizeUrl = new URL(config.authorizeUrl);

  Object.entries({ ...config.params, state }).forEach(([key, value]) => {
    authorizeUrl.searchParams.set(key, value);
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}


