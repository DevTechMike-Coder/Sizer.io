import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (process.env.COINGECKO_API) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API;
    }

    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false",
      {
        headers,
        next: { revalidate: 60 }, // Cache data across users for 60 seconds
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from CoinGecko" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}