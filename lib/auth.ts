import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomInt } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to your .env file."
  );
}
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "sizer_session_token";
const OTP_COOKIE_NAME = "sizer_pending_otp";

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string | null;
}

interface PendingOtpPayload extends TokenPayload {
  otpHash: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith("oauth:")) return false;
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function createPendingOtpChallenge(payload: TokenPayload): Promise<{ code: string; token: string }> {
  const code = randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(code, 10);
  const token = await new SignJWT({ ...payload, otpHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey);

  return { code, token };
}

export async function decodePendingOtpToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const pending = payload as unknown as PendingOtpPayload;
    return {
      userId: pending.userId,
      email: pending.email,
      name: pending.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function verifyPendingOtp(token: string, code: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const pending = payload as unknown as PendingOtpPayload;
    const isValid = await bcrypt.compare(code, pending.otpHash);

    if (!isValid) return null;

    return {
      userId: pending.userId,
      email: pending.email,
      name: pending.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME, OTP_COOKIE_NAME };
