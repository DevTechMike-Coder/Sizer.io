import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createPendingOtpChallenge, OTP_COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { riskProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const challenge = await createPendingOtpChallenge({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Send verification OTP to user's email
    await sendVerificationEmail({
      to: user.email,
      code: challenge.code,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      verificationRequired: true,
      otpDevCode: challenge.code,
      message: `A verification code has been sent to ${user.email}.`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        riskProfile: user.riskProfile,
      },
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during authentication." },
      { status: 500 }
    );
  }
}

