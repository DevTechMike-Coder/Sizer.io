import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createPendingOtpChallenge, OTP_COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        passwordHash,
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
      include: {
        riskProfile: true,
      },
    });

    const challenge = await createPendingOtpChallenge({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Send email verification to the signup email
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during registration." },
      { status: 500 }
    );
  }
}

