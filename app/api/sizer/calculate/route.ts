import { NextRequest, NextResponse } from "next/server";

interface CalculatePayload {
  symbol: string;
  assetName: string;
  category: "EQUITIES" | "FOREX" | "CRYPTO" | "COMMODITIES" | "INDICES";
  direction: "LONG" | "SHORT";
  accountEquity: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotMultiplier?: number;
  pipSize?: number;
  unitLabel?: string;
  propFirmMode?: boolean;
  maxDailyLossPercent?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: CalculatePayload = await req.json();
    const {
      symbol,
      assetName,
      category,
      direction,
      accountEquity,
      riskPercent,
      entryPrice,
      stopLoss,
      takeProfit,
      lotMultiplier,
      pipSize = 0.01,
      unitLabel = "Units",
      propFirmMode = true,
      maxDailyLossPercent = 5.0,
    } = body;

    // Mathematical Validations
    if (!accountEquity || accountEquity <= 0) {
      return NextResponse.json({ error: "Account equity must be greater than 0." }, { status: 400 });
    }

    if (!riskPercent || riskPercent <= 0 || riskPercent > 100) {
      return NextResponse.json({ error: "Risk percentage must be between 0.01% and 100%." }, { status: 400 });
    }

    if (!entryPrice || entryPrice <= 0) {
      return NextResponse.json({ error: "Entry price must be greater than 0." }, { status: 400 });
    }

    const stopDistance = Math.abs(entryPrice - stopLoss);
    const targetDistance = Math.abs(takeProfit - entryPrice);

    if (stopDistance <= 0) {
      return NextResponse.json({ error: "Stop loss cannot equal entry price." }, { status: 400 });
    }

    const isDirectionValid =
      direction === "LONG"
        ? stopLoss < entryPrice && takeProfit > entryPrice
        : stopLoss > entryPrice && takeProfit < entryPrice;

    if (!isDirectionValid) {
      return NextResponse.json(
        {
          error:
            direction === "LONG"
              ? "For a LONG setup, Stop Loss must be below entry and Take Profit must be above entry."
              : "For a SHORT setup, Stop Loss must be above entry and Take Profit must be below entry.",
        },
        { status: 400 }
      );
    }

    // Core Calculation Logic
    const riskDollar = (accountEquity * riskPercent) / 100;
    const rawUnits = riskDollar / stopDistance;
    const positionValue = rawUnits * entryPrice;
    const effectiveLeverage = positionValue / accountEquity;
    const riskRewardRatio = targetDistance / stopDistance;
    const potentialProfit = rawUnits * targetDistance;
    const lossPercentMove = (stopDistance / entryPrice) * 100;
    const gainPercentMove = (targetDistance / entryPrice) * 100;

    const pipsAtRisk = stopDistance / pipSize;
    const pipsTarget = targetDistance / pipSize;

    let standardLots = rawUnits;
    let miniLots = rawUnits;
    let microLots = rawUnits;

    if (lotMultiplier && lotMultiplier > 0) {
      standardLots = rawUnits / lotMultiplier;
      miniLots = standardLots * 10;
      microLots = standardLots * 100;
    }

    const propFirmWarning = propFirmMode && riskPercent > maxDailyLossPercent / 2;

    return NextResponse.json({
      success: true,
      result: {
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
        units: rawUnits,
        standardLots,
        miniLots,
        microLots,
        positionValue,
        effectiveLeverage,
        riskRewardRatio,
        potentialProfit,
        lossPercentMove,
        gainPercentMove,
        pipsAtRisk,
        pipsTarget,
        unitLabel,
        propFirmWarning,
      },
    });
  } catch (error: any) {
    console.error("Calculation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error during position calculation." },
      { status: 500 }
    );
  }
}
