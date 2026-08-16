import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET specific trade
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trade = await prisma.tradeSetup.findUnique({
      where: { id },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade setup not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch trade setup." }, { status: 500 });
  }
}

// PATCH update trade status or notes
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const updated = await prisma.tradeSetup.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true, trade: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update trade setup." }, { status: 500 });
  }
}

// DELETE trade
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.tradeSetup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Trade setup deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete trade setup." }, { status: 500 });
  }
}
