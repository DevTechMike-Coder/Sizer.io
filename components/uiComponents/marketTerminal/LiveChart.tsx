"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  ISeriesApi,
  IChartApi,
  Time,
  CandlestickData,
  HistogramData,
  LineData,
} from "lightweight-charts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CandlestickChart,
  LineChart,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  ChevronDown,
  Zap,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type TimeframeKey = "1m" | "5m" | "15m" | "1H" | "4H" | "1D";
export type ChartType = "candlestick" | "area" | "line";
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface MarketAsset {
  symbol: string; // Twelve Data Symbol
  displayName: string;
  name: string;
  category: "Equities" | "Indices" | "Forex" | "Crypto" | "Commodities";
  precision: number;
}

// 100% Real Live Multi-Asset Pairs via Twelve Data
export const SUPPORTED_MARKET_ASSETS: MarketAsset[] = [
  // Equities & Tech
  { symbol: "NVDA", displayName: "NVDA", name: "NVIDIA Corp.", category: "Equities", precision: 2 },
  { symbol: "AAPL", displayName: "AAPL", name: "Apple Inc.", category: "Equities", precision: 2 },
  { symbol: "TSLA", displayName: "TSLA", name: "Tesla Inc.", category: "Equities", precision: 2 },
  // Major Indices & ETFs
  { symbol: "SPY", displayName: "SPY", name: "S&P 500 ETF Trust", category: "Indices", precision: 2 },
  { symbol: "QQQ", displayName: "QQQ", name: "Invesco QQQ (Nasdaq 100)", category: "Indices", precision: 2 },
  // Forex Majors
  { symbol: "EUR/USD", displayName: "EUR / USD", name: "Euro / US Dollar", category: "Forex", precision: 4 },
  { symbol: "GBP/USD", displayName: "GBP / USD", name: "British Pound / USD", category: "Forex", precision: 4 },
  { symbol: "USD/JPY", displayName: "USD / JPY", name: "US Dollar / Japanese Yen", category: "Forex", precision: 3 },
  // Crypto
  { symbol: "BTC/USD", displayName: "BTC / USD", name: "Bitcoin", category: "Crypto", precision: 2 },
  { symbol: "ETH/USD", displayName: "ETH / USD", name: "Ethereum", category: "Crypto", precision: 2 },
  { symbol: "SOL/USD", displayName: "SOL / USD", name: "Solana", category: "Crypto", precision: 2 },
  // Commodities
  { symbol: "XAU/USD", displayName: "XAU / USD", name: "Gold Spot", category: "Commodities", precision: 2 },
  { symbol: "WTI/USD", displayName: "WTI / USD", name: "Crude Oil (WTI)", category: "Commodities", precision: 2 },
];

const TIMEFRAME_TO_TWELVEDATA: Record<TimeframeKey, { interval: string; seconds: number }> = {
  "1m": { interval: "1min", seconds: 60 },
  "5m": { interval: "5min", seconds: 300 },
  "15m": { interval: "15min", seconds: 900 },
  "1H": { interval: "1h", seconds: 3600 },
  "4H": { interval: "4h", seconds: 14400 },
  "1D": { interval: "1day", seconds: 86400 },
};

function calculateSMA(candles: CandlestickData<Time>[], period: number): LineData<Time>[] {
  const result: LineData<Time>[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(4)),
    });
  }
  return result;
}

function calculateEMA(candles: CandlestickData<Time>[], period: number): LineData<Time>[] {
  const result: LineData<Time>[] = [];
  if (candles.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result.push({ time: candles[period - 1].time, value: Number(ema.toFixed(4)) });

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result.push({ time: candles[i].time, value: Number(ema.toFixed(4)) });
  }
  return result;
}

export function LiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series References
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // UI States
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("5m");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time Active Candle & HUD Values
  const [activeCandle, setActiveCandle] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    isHovered: boolean;
  }>({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
    change: 0,
    changePercent: 0,
    isHovered: false,
  });

  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [high24h, setHigh24h] = useState<number>(0);
  const [low24h, setLow24h] = useState<number>(0);

  // UI Polish: price flash pulse, custom asset combobox, initial-load shimmer
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const prevPriceRef = useRef<number>(0);
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const assetMenuRef = useRef<HTMLDivElement>(null);

  const rawDataRef = useRef<{
    candles: CandlestickData<Time>[];
    volumes: HistogramData<Time>[];
  }>({ candles: [], volumes: [] });

  const activeAsset =
    SUPPORTED_MARKET_ASSETS.find((p) => p.symbol === selectedSymbol) || SUPPORTED_MARKET_ASSETS[0];

  const formatPrice = useCallback(
    (price: number) => {
      if (!price || isNaN(price)) return "—";
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: activeAsset.precision,
        maximumFractionDigits: activeAsset.precision,
      }).format(price);
    },
    [activeAsset.precision]
  );

  // 1. Initialize TradingView Lightweight Chart Canvas
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "#0B0E14" },
        textColor: "#94A3B8",
        fontSize: 12,
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(16, 185, 129, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#10b981",
        },
        horzLine: {
          color: "rgba(16, 185, 129, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#10b981",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: true,
        secondsVisible: selectedTimeframe === "1m",
      },
      width: container.clientWidth || 800,
      height: isFullscreen ? 700 : 480,
    });

    chartRef.current = chart;

    // Volume Overlay Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Reset series refs before recreating
    candlestickSeriesRef.current = null;
    areaSeriesRef.current = null;
    lineSeriesRef.current = null;
    ema20SeriesRef.current = null;
    sma50SeriesRef.current = null;

    // Main Price Series
    if (chartType === "candlestick") {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else if (chartType === "area") {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(16, 185, 129, 0.35)",
        bottomColor: "rgba(16, 185, 129, 0.0)",
        lineColor: "#10b981",
        lineWidth: 2,
      });
      areaSeriesRef.current = areaSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;
    }

    // Moving Average Overlays (if active at init)
    if (showIndicators) {
      const ema20 = chart.addSeries(LineSeries, {
        color: "#06b6d4",
        lineWidth: 1,
        title: "EMA 20",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      ema20SeriesRef.current = ema20;

      const sma50 = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 1,
        title: "SMA 50",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      sma50SeriesRef.current = sma50;
    }

    // Immediate population of cached data to avoid blank chart on chartType/fullscreen/re-init
    const cachedCandles = rawDataRef.current.candles;
    const cachedVolumes = rawDataRef.current.volumes;
    if (cachedCandles.length > 0) {
      if (candlestickSeriesRef.current) candlestickSeriesRef.current.setData(cachedCandles);
      if (areaSeriesRef.current) areaSeriesRef.current.setData(cachedCandles.map((c) => ({ time: c.time, value: c.close })));
      if (lineSeriesRef.current) lineSeriesRef.current.setData(cachedCandles.map((c) => ({ time: c.time, value: c.close })));
      if (volumeSeriesRef.current) volumeSeriesRef.current.setData(cachedVolumes);
      if (showIndicators) {
        if (ema20SeriesRef.current && cachedCandles.length > 20) ema20SeriesRef.current.setData(calculateEMA(cachedCandles, 20));
        if (sma50SeriesRef.current && cachedCandles.length > 50) sma50SeriesRef.current.setData(calculateSMA(cachedCandles, 50));
      }
      chart.timeScale().fitContent();
    }

    // Crosshair Hover Inspection Listener
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        const candles = rawDataRef.current.candles;
        if (candles.length > 0) {
          const lastCandle = candles[candles.length - 1];
          const firstCandle = candles[0];
          const priceChange = lastCandle.close - firstCandle.open;
          setActiveCandle((prev) => ({
            ...prev,
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close,
            change: priceChange,
            changePercent: (priceChange / (firstCandle.open || 1)) * 100,
            isHovered: false,
          }));
        }
        return;
      }

      let hoveredBar: CandlestickData<Time> | undefined;
      if (candlestickSeriesRef.current) {
        const data = param.seriesData.get(candlestickSeriesRef.current) as CandlestickData<Time> | undefined;
        if (data) hoveredBar = data;
      }

      if (!hoveredBar) {
        hoveredBar = rawDataRef.current.candles.find((c) => c.time === param.time);
      }

      if (hoveredBar) {
        const barChange = hoveredBar.close - hoveredBar.open;
        const barChangePct = (barChange / (hoveredBar.open || 1)) * 100;
        const vol = rawDataRef.current.volumes.find((v) => v.time === param.time)?.value || 0;

        setActiveCandle({
          open: hoveredBar.open,
          high: hoveredBar.high,
          low: hoveredBar.low,
          close: hoveredBar.close,
          volume: Number(vol),
          change: barChange,
          changePercent: barChangePct,
          isHovered: true,
        });
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width,
          height: isFullscreen ? 700 : 480,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
      areaSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ema20SeriesRef.current = null;
      sma50SeriesRef.current = null;
    };
  }, [chartType, isFullscreen, selectedTimeframe]);

  // Dynamic Indicator toggling without destroying and resetting the chart
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const candles = rawDataRef.current.candles;

    if (showIndicators) {
      if (!ema20SeriesRef.current) {
        const ema20 = chart.addSeries(LineSeries, {
          color: "#06b6d4",
          lineWidth: 1,
          title: "EMA 20",
          lastValueVisible: false,
          priceLineVisible: false,
        });
        ema20SeriesRef.current = ema20;
        if (candles.length > 20) {
          ema20.setData(calculateEMA(candles, 20));
        }
      }
      if (!sma50SeriesRef.current) {
        const sma50 = chart.addSeries(LineSeries, {
          color: "#f59e0b",
          lineWidth: 1,
          title: "SMA 50",
          lastValueVisible: false,
          priceLineVisible: false,
        });
        sma50SeriesRef.current = sma50;
        if (candles.length > 50) {
          sma50.setData(calculateSMA(candles, 50));
        }
      }
    } else {
      if (ema20SeriesRef.current) {
        try {
          chart.removeSeries(ema20SeriesRef.current);
        } catch {}
        ema20SeriesRef.current = null;
      }
      if (sma50SeriesRef.current) {
        try {
          chart.removeSeries(sma50SeriesRef.current);
        } catch {}
        sma50SeriesRef.current = null;
      }
    }
  }, [showIndicators]);

  // 2. Real-Time Twelve Data Historical Ingestion & WebSocket Stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isSubscribed = true;
    const apiKey = process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY || "1f3e84dacbb94657b0416c92dbb725ce";
    const tfConfig = TIMEFRAME_TO_TWELVEDATA[selectedTimeframe];

    async function loadTwelveDataFeed() {
      setConnectionStatus("connecting");
      setErrorMessage(null);

      try {
        // Step A: Load real historical klines via Twelve Data REST API
        const encodedSymbol = encodeURIComponent(selectedSymbol);
        const restUrl = `https://api.twelvedata.com/time_series?symbol=${encodedSymbol}&interval=${tfConfig.interval}&outputsize=100&apikey=${apiKey}`;
        const res = await fetch(restUrl);
        const json = await res.json();

        if (!isSubscribed) return;

        if (json.status !== "ok" || !json.values || json.values.length === 0) {
          throw new Error(json.message || "Twelve Data could not load candles for this symbol.");
        }

        // Twelve Data returns newest first -> reverse to get chronological ascending order
        const sortedValues = [...json.values].reverse();

        const candles: CandlestickData<Time>[] = [];
        const volumes: HistogramData<Time>[] = [];

        sortedValues.forEach((item: any) => {
          // Parse timestamp safely
          let timeVal: number;
          if (item.datetime.includes(" ")) {
            // "YYYY-MM-DD HH:mm:ss"
            timeVal = Math.floor(new Date(item.datetime.replace(" ", "T") + "Z").getTime() / 1000);
          } else {
            // "YYYY-MM-DD"
            timeVal = Math.floor(new Date(item.datetime + "T00:00:00Z").getTime() / 1000);
          }

          if (isNaN(timeVal)) return;

          const open = parseFloat(item.open);
          const high = parseFloat(item.high);
          const low = parseFloat(item.low);
          const close = parseFloat(item.close);
          const vol = item.volume ? parseFloat(item.volume) : 100;

          candles.push({
            time: timeVal as Time,
            open,
            high,
            low,
            close,
          });

          volumes.push({
            time: timeVal as Time,
            value: vol,
            color: close >= open ? "rgba(34, 197, 94, 0.45)" : "rgba(239, 68, 68, 0.45)",
          });
        });

        rawDataRef.current = { candles, volumes };

        // Set series data
        if (candlestickSeriesRef.current) candlestickSeriesRef.current.setData(candles);
        if (areaSeriesRef.current) areaSeriesRef.current.setData(candles.map((c) => ({ time: c.time, value: c.close })));
        if (lineSeriesRef.current) lineSeriesRef.current.setData(candles.map((c) => ({ time: c.time, value: c.close })));
        if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volumes);
        if (ema20SeriesRef.current && candles.length > 20) ema20SeriesRef.current.setData(calculateEMA(candles, 20));
        if (sma50SeriesRef.current && candles.length > 50) sma50SeriesRef.current.setData(calculateSMA(candles, 50));

        chartRef.current?.timeScale().fitContent();

        // Calculate HUD stats
        if (candles.length > 0) {
          const lastCandle = candles[candles.length - 1];
          const firstCandle = candles[0];
          let highest = -Infinity;
          let lowest = Infinity;
          candles.forEach((c) => {
            if (c.high > highest) highest = c.high;
            if (c.low < lowest) lowest = c.low;
          });

          setCurrentPrice(lastCandle.close);
          setHigh24h(highest);
          setLow24h(lowest);
          setActiveCandle({
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close,
            volume: Number(volumes[volumes.length - 1]?.value || 0),
            change: lastCandle.close - firstCandle.open,
            changePercent: ((lastCandle.close - firstCandle.open) / (firstCandle.open || 1)) * 100,
            isHovered: false,
          });
        }

        // Step B: Connect to Twelve Data Real-Time WebSocket
        const wsUrl = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${apiKey}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isSubscribed) return;
          setConnectionStatus("connected");
          // Subscribe to selected symbol
          ws?.send(
            JSON.stringify({
              action: "subscribe",
              params: {
                symbols: selectedSymbol,
              },
            })
          );
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === "price" && (msg.symbol === selectedSymbol || msg.symbol === selectedSymbol.replace("/", ""))) {
              const livePrice = parseFloat(msg.price);
              if (isNaN(livePrice)) return;

              const existingCandles = rawDataRef.current.candles;
              if (existingCandles.length === 0) return;

              const lastCandle = { ...existingCandles[existingCandles.length - 1] };
              const lastVol = { ...rawDataRef.current.volumes[rawDataRef.current.volumes.length - 1] };

              const nowSeconds = Math.floor(Date.now() / 1000);
              const lastCandleTime = Number(lastCandle.time);

              // Check if we should create a new candle or update current candle
              if (nowSeconds - lastCandleTime >= tfConfig.seconds) {
                const newBar: CandlestickData<Time> = {
                  time: nowSeconds as Time,
                  open: lastCandle.close,
                  high: Math.max(lastCandle.close, livePrice),
                  low: Math.min(lastCandle.close, livePrice),
                  close: livePrice,
                };
                existingCandles.push(newBar);

                const newVol: HistogramData<Time> = {
                  time: nowSeconds as Time,
                  value: 10,
                  color: livePrice >= lastCandle.close ? "rgba(34, 197, 94, 0.45)" : "rgba(239, 68, 68, 0.45)",
                };
                rawDataRef.current.volumes.push(newVol);

                if (candlestickSeriesRef.current) candlestickSeriesRef.current.update(newBar);
                if (areaSeriesRef.current) areaSeriesRef.current.update({ time: newBar.time, value: newBar.close });
                if (lineSeriesRef.current) lineSeriesRef.current.update({ time: newBar.time, value: newBar.close });
                if (volumeSeriesRef.current) volumeSeriesRef.current.update(newVol);
              } else {
                lastCandle.close = livePrice;
                lastCandle.high = Math.max(lastCandle.high, livePrice);
                lastCandle.low = Math.min(lastCandle.low, livePrice);
                existingCandles[existingCandles.length - 1] = lastCandle;

                if (candlestickSeriesRef.current) candlestickSeriesRef.current.update(lastCandle);
                if (areaSeriesRef.current) areaSeriesRef.current.update({ time: lastCandle.time, value: lastCandle.close });
                if (lineSeriesRef.current) lineSeriesRef.current.update({ time: lastCandle.time, value: lastCandle.close });
              }

              setCurrentPrice(livePrice);
              setHigh24h((prev) => Math.max(prev, livePrice));
              setLow24h((prev) => (prev === 0 ? livePrice : Math.min(prev, livePrice)));

              setActiveCandle((prev) => {
                if (prev.isHovered) return prev;
                const first = existingCandles[0];
                const change = livePrice - first.open;
                return {
                  open: lastCandle.open,
                  high: lastCandle.high,
                  low: lastCandle.low,
                  close: livePrice,
                  volume: Number(lastVol.value),
                  change,
                  changePercent: (change / (first.open || 1)) * 100,
                  isHovered: false,
                };
              });
            }
          } catch (e) {
            console.error("Twelve Data WS message error:", e);
          }
        };

        ws.onerror = () => {
          if (isSubscribed) {
            setConnectionStatus("error");
          }
        };

        ws.onclose = () => {
          if (isSubscribed) setConnectionStatus("disconnected");
        };
      } catch (err: any) {
        console.error("Twelve Data fetch error:", err);
        if (isSubscribed) {
          setConnectionStatus("error");
          setErrorMessage(err.message || "Failed to fetch Twelve Data stream.");
        }
      }
    }

    loadTwelveDataFeed();

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
    };
  }, [selectedSymbol, selectedTimeframe]);

  const handleResetZoom = () => {
    chartRef.current?.timeScale().fitContent();
  };

  // Flash the live price pill briefly on each tick, direction-aware
  useEffect(() => {
    const price = activeCandle.close || currentPrice;
    if (!price) return;
    if (prevPriceRef.current && price !== prevPriceRef.current) {
      setPriceFlash(price > prevPriceRef.current ? "up" : "down");
      const t = setTimeout(() => setPriceFlash(null), 450);
      prevPriceRef.current = price;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = price;
  }, [activeCandle.close, currentPrice]);

  // Close the asset combobox on outside click / Escape
  useEffect(() => {
    if (!assetMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (assetMenuRef.current && !assetMenuRef.current.contains(e.target as Node)) {
        setAssetMenuOpen(false);
        setAssetSearch("");
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAssetMenuOpen(false);
        setAssetSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [assetMenuOpen]);

  // Exit fullscreen on Escape and lock page scroll while active
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  const filteredAssets = SUPPORTED_MARKET_ASSETS.filter((a) => {
    const q = assetSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.displayName.toLowerCase().includes(q)
    );
  });
  const assetsByCategory = filteredAssets.reduce<Record<string, MarketAsset[]>>((acc, a) => {
    (acc[a.category] ||= []).push(a);
    return acc;
  }, {});

  const isPositiveChange = activeCandle.change >= 0;

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div
        className={`dark relative w-full rounded-2xl border border-zinc-800/80 bg-[#0B0E14]/95 text-zinc-100 backdrop-blur-xl shadow-2xl transition-all ${
          isFullscreen ? "fixed inset-4 z-50 overflow-y-auto" : ""
        }`}
      >
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3 sm:px-6">
        {/* Multi-Asset Selector & Status Beacon */}
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu open={assetMenuOpen} onOpenChange={setAssetMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 gap-2 rounded-xl border-zinc-700/80 bg-zinc-900/90 px-3.5 text-sm font-bold text-zinc-100 hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-white focus:border-emerald-500 cursor-pointer"
                aria-label="Select market asset"
              >
                <span className="text-zinc-100">{activeAsset.displayName}</span>
                <span className="hidden text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:inline">
                  {activeAsset.category}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${assetMenuOpen ? "rotate-180" : ""}`} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-72 border-zinc-800 bg-zinc-950/95 p-0 shadow-2xl backdrop-blur-xl text-zinc-100"
            >
              <div className="border-b border-zinc-800/80 p-2">
                <Input
                  autoFocus
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search symbol or name…"
                  className="h-8 w-full border-zinc-800 bg-zinc-900/90 px-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-0"
                />
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {Object.keys(assetsByCategory).length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-zinc-500">No matches</div>
                )}
                {Object.entries(assetsByCategory).map(([category, assets]) => (
                  <DropdownMenuGroup key={category}>
                    <DropdownMenuLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      {category}
                    </DropdownMenuLabel>
                    {assets.map((asset) => (
                      <DropdownMenuItem
                        key={asset.symbol}
                        onClick={() => {
                          setSelectedSymbol(asset.symbol);
                          setAssetMenuOpen(false);
                          setAssetSearch("");
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-xs cursor-pointer ${
                          asset.symbol === selectedSymbol
                            ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                            : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                        }`}
                      >
                        <span className="font-semibold text-zinc-100">{asset.displayName}</span>
                        <span className="truncate text-[11px] text-zinc-400">{asset.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Real-Time WebSocket Status Badge */}
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span>LIVE TWELVE DATA WS</span>
            </div>
          )}

          {connectionStatus === "connecting" && (
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-amber-400">
              <span className="animate-spin h-2 w-2 border-2 border-amber-400 border-t-transparent rounded-full" />
              <span>FETCHING FEED...</span>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-red-400">
              <WifiOff className="h-3 w-3 text-red-400" />
              <span>FEED ERROR</span>
            </div>
          )}

          {connectionStatus === "disconnected" && (
            <div className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-mono font-medium text-zinc-400">
              <WifiOff className="h-3 w-3 text-zinc-400" />
              <span>DISCONNECTED</span>
            </div>
          )}
        </div>

        {/* Timeframes & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5">
            {(["1m", "5m", "15m", "1H", "4H", "1D"] as TimeframeKey[]).map((tf) => (
              <Button
                key={tf}
                size="xs"
                variant={selectedTimeframe === tf ? "default" : "ghost"}
                onClick={() => setSelectedTimeframe(tf)}
                className={`rounded-lg px-2.5 text-xs font-semibold cursor-pointer ${
                  selectedTimeframe === tf
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5">
            <Button
              size="icon-xs"
              variant={chartType === "candlestick" ? "default" : "ghost"}
              onClick={() => setChartType("candlestick")}
              title="Candlestick Chart"
              className={`rounded-lg cursor-pointer ${
                chartType === "candlestick"
                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <CandlestickChart className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant={chartType === "area" ? "default" : "ghost"}
              onClick={() => setChartType("area")}
              title="Area Mountain Chart"
              className={`rounded-lg cursor-pointer ${
                chartType === "area"
                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant={chartType === "line" ? "default" : "ghost"}
              onClick={() => setChartType("line")}
              title="Line Chart"
              className={`rounded-lg cursor-pointer ${
                chartType === "line"
                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Indicator Toggle */}
          <Button
            size="xs"
            variant="outline"
            onClick={() => setShowIndicators(!showIndicators)}
            title="Toggle Moving Averages (EMA 20 & SMA 50)"
            className={`gap-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              showIndicators
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                : "border-zinc-700/60 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">EMA/SMA</span>
          </Button>

          {/* Reset Zoom */}
          <Button
            size="icon-xs"
            variant="outline"
            onClick={handleResetZoom}
            title="Reset Chart Zoom"
            className="rounded-xl border-zinc-700/60 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            size="icon-xs"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="rounded-xl border-zinc-700/60 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Real-Time Telemetry HUD Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/70 px-4 py-2.5 sm:px-6">
        {/* Live Price & Change */}
        <div className="flex items-baseline gap-3">
          <div
            className={`rounded-md px-1.5 -mx-1.5 text-2xl font-black tracking-tight text-white font-mono transition-colors duration-300 ${
              priceFlash === "up" ? "bg-emerald-500/20" : priceFlash === "down" ? "bg-red-500/20" : "bg-transparent"
            }`}
          >
            ${formatPrice(activeCandle.close || currentPrice)}
          </div>
          <div
            className={`flex items-center gap-0.5 text-xs font-bold font-mono ${
              isPositiveChange ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositiveChange ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>
              {isPositiveChange ? "+" : ""}
              {formatPrice(activeCandle.change)} ({activeCandle.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Real-time OHLCV Inspector Strip */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono tabular-nums text-zinc-400">
          <div>
            <span className="text-zinc-500">O: </span>
            <span className="font-semibold text-zinc-100">${formatPrice(activeCandle.open)}</span>
          </div>
          <div>
            <span className="text-zinc-500">H: </span>
            <span className="font-semibold text-zinc-100">${formatPrice(activeCandle.high)}</span>
          </div>
          <div>
            <span className="text-zinc-500">L: </span>
            <span className="font-semibold text-zinc-100">${formatPrice(activeCandle.low)}</span>
          </div>
          <div>
            <span className="text-zinc-500">C: </span>
            <span className="font-semibold text-zinc-100">${formatPrice(activeCandle.close)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Vol: </span>
            <span className="font-semibold text-zinc-200">
              {activeCandle.volume >= 1000000
                ? `${(activeCandle.volume / 1000000).toFixed(2)}M`
                : activeCandle.volume >= 1000
                ? `${(activeCandle.volume / 1000).toFixed(2)}K`
                : activeCandle.volume.toFixed(2)}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-zinc-800">
            <div>
              <span className="text-zinc-500">24h High: </span>
              <span className="font-semibold text-emerald-400">${formatPrice(high24h)}</span>
            </div>
            <div>
              <span className="text-zinc-500">24h Low: </span>
              <span className="font-semibold text-red-400">${formatPrice(low24h)}</span>
            </div>
          </div>
        </div>

        {/* Direct Link to Sizer */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Link href={`/sizer?symbol=${encodeURIComponent(activeAsset.displayName)}&price=${activeCandle.close || currentPrice}`}>
              <Zap className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              Size Position @ ${formatPrice(activeCandle.close || currentPrice)}
            </Link>
          </Button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full p-2 sm:p-4">
        {errorMessage && (
          <div className="absolute inset-x-8 top-12 z-20 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 text-xs text-red-200 backdrop-blur">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {showIndicators && (
          <div className="absolute top-6 left-6 z-10 flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              EMA (20)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              SMA (50)
            </span>
          </div>
        )}

        <div className="relative">
          <div
            ref={chartContainerRef}
            className="w-full rounded-xl overflow-hidden shadow-inner"
            style={{ height: isFullscreen ? "700px" : "480px" }}
          />

          {connectionStatus === "connecting" && currentPrice === 0 && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[#0B0E14]"
              style={{ height: isFullscreen ? "700px" : "480px" }}
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
              <div className="flex flex-col items-center gap-1.5 text-xs font-mono text-zinc-500">
                <span>Loading {activeAsset.displayName} candles…</span>
                <span className="text-zinc-700">Twelve Data · {selectedTimeframe}</span>
              </div>
              <div className="mt-1 flex w-2/3 max-w-xs gap-1">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 flex-1 animate-pulse rounded-sm bg-zinc-800/60"
                    style={{ animationDelay: `${i * 120}ms`, height: `${28 + (i % 3) * 14}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Data Feeds Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 bg-zinc-950/70 px-4 py-2.5 sm:px-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            Provider: <strong className="text-zinc-300">Twelve Data Real-Time Multi-Asset API</strong>
          </span>
          <span className="text-zinc-700">•</span>
          <span>Engine: TradingView Lightweight Charts™ v5</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono min-w-0">
          <span className="text-zinc-500">
            Resolution: <strong className="text-zinc-300">{selectedTimeframe}</strong>
          </span>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <span className="text-zinc-500 min-w-0 break-all sm:break-normal">
            Stream: <strong className="text-emerald-400 break-all">wss://ws.twelvedata.com/v1/quotes/price</strong>
          </span>
        </div>
      </div>
      </div>
    </>
  );
}