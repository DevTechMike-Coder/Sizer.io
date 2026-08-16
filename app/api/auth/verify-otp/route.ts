import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME, OTP_COOKIE_NAME, verifyPendingOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim();
    const pendingToken = req.cookies.get(OTP_COOKIE_NAME)?.value;

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the 6-digit verification code." }, { status: 400 });
    }

    if (!pendingToken) {
      return NextResponse.json({ error: "Verification session expired. Please sign in again." }, { status: 401 });
    }

    const payload = await verifyPendingOtp(pendingToken, code);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 });
    }

    const sessionToken = await createSessionToken(payload);
    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set({
      name: OTP_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during verification." },
      { status: 500 }
    );
  }
}

