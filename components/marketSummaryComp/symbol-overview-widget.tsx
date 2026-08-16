"use client";

import React, { useEffect, useRef, memo } from "react";

function SymbolOverviewWidgetComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous contents to prevent script duplication on hot-reload
    containerRef.current.innerHTML = "";

    // Re-create the inner widget container expected by TradingView
    const widgetWrapper = document.createElement("div");
    widgetWrapper.className = "tradingview-widget-container__widget h-full w-full";
    containerRef.current.appendChild(widgetWrapper);

    // Create and append the configuration script
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      lineWidth: 2,
      lineType: 0,
      chartType: "area",
      fontColor: "rgb(106, 109, 120)",
      gridLineColor: "rgba(242, 242, 242, 0.06)",
      volumeUpColor: "rgba(34, 171, 148, 0.5)",
      volumeDownColor: "rgba(247, 82, 95, 0.5)",
      backgroundColor: "#0F0F0F",
      widgetFontColor: "#DBDBDB",
      upColor: "#22ab94",
      downColor: "#f7525f",
      borderUpColor: "#22ab94",
      borderDownColor: "#f7525f",
      wickUpColor: "#22ab94",
      wickDownColor: "#f7525f",
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
      chartOnly: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      valuesTracking: "1",
      changeMode: "price-and-percent",
      symbols: [
        ["Apple", "NASDAQ:AAPL|1D"],
        ["Google", "NASDAQ:GOOGL|1D"],
        ["Microsoft", "NASDAQ:MSFT|1D"],
        ["Bitcoin", "BITSTAMP:BTCUSD|1D"],
        ["Gold", "OANDA:XAUUSD|1D"],
        ["EUR/USD", "OANDA:EURUSD|1D"],
      ],
      dateRanges: [
        "1d|1",
        "1m|30",
        "3m|60",
        "12m|1D",
        "60m|1W",
        "all|1M",
      ],
      fontSize: "10",
      headerFontSize: "medium",
      autosize: true,
      width: "100%",
      height: "100%",
      noTimeScale: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="relative h-[550px] min-h-[500px] w-full overflow-hidden rounded-xl border border-border/50 bg-card p-2 shadow-2xl">
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  );
}

export const SymbolOverviewWidget = memo(SymbolOverviewWidgetComponent);