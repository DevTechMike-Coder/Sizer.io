import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Retrieve all saved trade setups for the current user or guest
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    const trades = await prisma.tradeSetup.findMany({
      where: session ? { userId: session.userId } : { userId: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, trades });
  } catch (error: any) {
    console.error("Trades GET error:", error);
    return NextResponse.json({ error: "Failed to fetch saved trade setups." }, { status: 500 });
  }
}

// POST: Save a new calculated trade blueprint ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();

    const {
      symbol,
      assetName,
      category,
      direction,
      accountEquity,
      riskPercent,
      riskDollar,
      entryPrice,
      stopLoss,
      takeProfit,
      recommendedSize,
      unitLabel,
      lotMultiplier,
      riskRewardRatio,
      potentialProfit,
      pipsAtRisk,
      pipsTarget,
      notes,
    } = body;

    if (!symbol || !entryPrice || !stopLoss || !takeProfit) {
      return NextResponse.json({ error: "Missing required trade setup fields." }, { status: 400 });
    }

    const trade = await prisma.tradeSetup.create({
      data: {
        userId: session?.userId || null,
        symbol,
        assetName: assetName || symbol,
        category: category || "EQUITIES",
        direction: direction || "LONG",
        accountEquity: Number(accountEquity),
        riskPercent: Number(riskPercent),
        riskDollar: Number(riskDollar),
        entryPrice: Number(entryPrice),
        stopLoss: Number(stopLoss),
        takeProfit: Number(takeProfit),
        recommendedSize: Number(recommendedSize),
        unitLabel: unitLabel || "Units",
        lotMultiplier: lotMultiplier ? Number(lotMultiplier) : null,
        riskRewardRatio: Number(riskRewardRatio),
        potentialProfit: Number(potentialProfit),
        pipsAtRisk: pipsAtRisk ? Number(pipsAtRisk) : null,
        pipsTarget: pipsTarget ? Number(pipsTarget) : null,
        notes: notes || null,
        status: "PLANNED",
      },
    });

    return NextResponse.json({ success: true, trade }, { status: 201 });
  } catch (error: any) {
    console.error("Trades POST error:", error);
    return NextResponse.json({ error: "Failed to save trade setup." }, { status: 500 });
  }
}
