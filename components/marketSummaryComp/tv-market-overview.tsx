"use client";

import Script from "next/script";

export function TVMarketOverview() {
  const sectors = JSON.stringify([
    {
      sectionName: "Indices",
      symbols: [
        "FOREXCOM:SPXUSD",
        "FOREXCOM:NSXUSD",
        "FOREXCOM:DJI",
        "FOREXCOM:UKXGBP",
      ],
    },
    {
      sectionName: "Stocks",
      symbols: ["NASDAQ:AAPL", "NASDAQ:ADBE", "NASDAQ:NVDA", "NASDAQ:TSLA"],
    },
    {
      sectionName: "Crypto",
      symbols: ["BITSTAMP:BTCUSD", "BITSTAMP:ETHUSD", "CRYPTO:XRPUSD"],
    },
    {
      sectionName: "Forex",
      symbols: ["OANDA:EURUSD", "OANDA:GBPUSD", "OANDA:EURGBP", "FX:USDJPY"],
    },
  ]);

  return (
    <>
      {/* Load TradingView Web Component script asynchronously */}
      <Script
        src="https://widgets.tradingview-widget.com/w/en/tv-market-overview.js"
        type="module"
        strategy="afterInteractive"
      />

      <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-card p-2 shadow-2xl">
        {/* @ts-expect-error - Ignore TypeScript warning for custom web component element */}
        <tv-market-overview
          symbol-sectors={sectors}
          color-theme="dark"
          is-transparent="true"
          width="100%"
          height="550"
        />
      </div>
    </>
  );
}