import { NextRequest, NextResponse } from "next/server";

const TWELVEDATA_API_KEY = process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY || process.env.TWELVEDATA_API_KEY || "";

// In-memory cache to avoid rate limit penalties
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol") || "NVDA";

    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, source: "cache", data: cached.data });
    }

    if (!TWELVEDATA_API_KEY) {
      return NextResponse.json({
        success: true,
        source: "mock",
        data: { symbol, price: "225.16", change: "+1.85%", isLive: false },
      });
    }

    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVEDATA_API_KEY}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from market provider." }, { status: res.status });
    }

    const data = await res.json();
    cache.set(symbol, { data, timestamp: Date.now() });

    return NextResponse.json({ success: true, source: "live", data });
  } catch (error: any) {
    console.error("Market quotes proxy error:", error);
    return NextResponse.json({ error: "Internal error fetching market quote." }, { status: 500 });
  }
}
