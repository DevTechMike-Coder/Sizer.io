"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

export function CryptoMarketTable() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "GAINERS" | "LOSERS">("ALL");
  const [sortBy, setSortBy] = useState<"rank" | "price" | "change">("rank");

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crypto-markets");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoins(data);
      }
    } catch (err) {
      console.error("Failed to load crypto markets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // Filter and Sort Logic
  const filteredCoins = useMemo(() => {
    return coins
      .filter((coin) => {
        const matchesSearch =
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterType === "GAINERS") return matchesSearch && coin.price_change_percentage_24h > 0;
        if (filterType === "LOSERS") return matchesSearch && coin.price_change_percentage_24h < 0;
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price") return b.current_price - a.current_price;
        if (sortBy === "change") return b.price_change_percentage_24h - a.price_change_percentage_24h;
        return a.market_cap_rank - b.market_cap_rank;
      });
  }, [coins, searchQuery, filterType, sortBy]);

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card p-6 shadow-2xl backdrop-blur">
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Crypto Market Overview</h3>
          <p className="text-xs text-muted-foreground">Search and filter top tokens by market cap.</p>
        </div>

        <button
          onClick={fetchCoins}
          disabled={loading}
          className="flex items-center gap-1.5 self-start rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 sm:self-auto cursor-pointer transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        {/* Search Input using shadcn Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search coin or symbol (e.g., BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs bg-background/80"
          />
        </div>

        {/* Filter Buttons & Sort Dropdown using shadcn Select */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1 text-xs">
            {(["ALL", "GAINERS", "LOSERS"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
                  filterType === type
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "rank" | "price" | "change")}>
            <SelectTrigger className="w-[140px] text-xs font-semibold bg-background/80">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Sort: Rank</SelectItem>
              <SelectItem value="price">Sort: Price</SelectItem>
              <SelectItem value="change">Sort: 24h Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Display */}
      {loading && coins.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">Loading crypto markets...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 pl-2">#</th>
                <th className="pb-3">Asset</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">24h Change</th>
                <th className="pb-3 text-right pr-2">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-mono">
              {filteredCoins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                return (
                  <tr key={coin.id} className="transition hover:bg-muted/30">
                    <td className="py-3.5 pl-2 font-medium text-muted-foreground">{coin.market_cap_rank}</td>
                    <td className="py-3.5 font-sans">
                      <div className="flex items-center gap-2.5">
                        <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                        <span className="font-bold text-foreground">{coin.name}</span>
                        <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-foreground">
                      ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 font-semibold text-foreground">
                      ${coin.market_cap.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}