"use client";

import Script from "next/script";

interface TickerTapeProps {
  symbols?: string;
  colorTheme?: "dark" | "light";
}

export function TradingViewTickerWebComponent({
  symbols = "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD",
  colorTheme = "dark",
}: TickerTapeProps) {
  return (
    <>
      {/* Load the Web Component Script dynamically */}
      <Script
        src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"
        type="module"
        strategy="afterInteractive"
      />

      {/* Render the Custom HTML Element */}
      <div className="w-full border-b border-border/40 bg-background/50 backdrop-blur">
        {/* @ts-expect-error - Ignore TypeScript warning for custom web component element */}
        <tv-ticker-tape
          symbols={symbols}
          color-theme={colorTheme}
          is-transparent="true"
        />
      </div>
    </>
  );
}