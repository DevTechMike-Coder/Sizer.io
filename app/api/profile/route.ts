import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Retrieve the authenticated user's profile, risk profile, and trade stats
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { riskProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const tradeCount = await prisma.tradeSetup.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        riskProfile: user.riskProfile,
      },
      stats: { tradeCount },
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

// PATCH: Update the authenticated user's name and/or risk profile settings.
// Scoped entirely to the session's own userId — never accepts a target user id from the client.
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await req.json();
    const { name, defaultEquity, defaultRiskPercent, defaultLeverage, propFirmMode, maxDailyLossPercent } = body;

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }

    const riskFields: Record<string, number | boolean> = {};

    if (defaultEquity !== undefined) {
      const val = Number(defaultEquity);
      if (!Number.isFinite(val) || val <= 0) {
        return NextResponse.json({ error: "Account equity must be a positive number." }, { status: 400 });
      }
      riskFields.defaultEquity = val;
    }

    if (defaultRiskPercent !== undefined) {
      const val = Number(defaultRiskPercent);
      if (!Number.isFinite(val) || val <= 0 || val > 100) {
        return NextResponse.json({ error: "Risk percent must be between 0 and 100." }, { status: 400 });
      }
      riskFields.defaultRiskPercent = val;
    }

    if (defaultLeverage !== undefined) {
      const val = Number(defaultLeverage);
      if (!Number.isFinite(val) || val <= 0 || val > 500) {
        return NextResponse.json({ error: "Leverage must be between 0 and 500." }, { status: 400 });
      }
      riskFields.defaultLeverage = val;
    }

    if (maxDailyLossPercent !== undefined) {
      const val = Number(maxDailyLossPercent);
      if (!Number.isFinite(val) || val <= 0 || val > 100) {
        return NextResponse.json({ error: "Max daily loss percent must be between 0 and 100." }, { status: 400 });
      }
      riskFields.maxDailyLossPercent = val;
    }

    if (propFirmMode !== undefined) {
      if (typeof propFirmMode !== "boolean") {
        return NextResponse.json({ error: "Invalid prop firm mode value." }, { status: 400 });
      }
      riskFields.propFirmMode = propFirmMode;
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined ? { name: name.trim() || null } : {}),
        ...(Object.keys(riskFields).length > 0
          ? {
              riskProfile: {
                upsert: {
                  create: {
                    defaultEquity: 50000,
                    defaultRiskPercent: 1.0,
                    defaultLeverage: 1.0,
                    propFirmMode: true,
                    maxDailyLossPercent: 5.0,
                    ...riskFields,
                  },
                  update: riskFields,
                },
              },
            }
          : {}),
      },
      include: { riskProfile: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        riskProfile: user.riskProfile,
      },
    });
  } catch (error: any) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
