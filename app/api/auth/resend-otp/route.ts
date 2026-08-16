import { NextRequest, NextResponse } from "next/server";
import { createPendingOtpChallenge, decodePendingOtpToken, OTP_COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const pendingToken = req.cookies.get(OTP_COOKIE_NAME)?.value;

    if (!pendingToken) {
      return NextResponse.json(
        { error: "Verification session expired. Please sign in or register again." },
        { status: 401 }
      );
    }

    const payload = await decodePendingOtpToken(pendingToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid verification session. Please sign in again." },
        { status: 401 }
      );
    }

    const challenge = await createPendingOtpChallenge({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    });

    // Send email to user
    await sendVerificationEmail({
      to: payload.email,
      code: challenge.code,
      name: payload.name,
    });

    const response = NextResponse.json({
      success: true,
      message: `A new verification code was sent to ${payload.email}.`,
      otpDevCode: challenge.code,
    });

    response.cookies.set({
      name: OTP_COOKIE_NAME,
      value: challenge.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resend verification code." },
      { status: 500 }
    );
  }
}
