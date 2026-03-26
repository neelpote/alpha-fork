const mockData = {
  metrics: {
    apy: "14.5",
    totalProfit: "245000",
    maxDrawdown: "-8.4",
    sharpeRatio: "2.1",
  },
  equity: [
    { date: "2026-01-01", value: 100000 },
    { date: "2026-01-15", value: 105000 },
    { date: "2026-02-01", value: 112000 },
    { date: "2026-02-15", value: 108000 },
    { date: "2026-03-01", value: 118000 },
    { date: "2026-03-15", value: 125000 },
    { date: "2026-03-26", value: 132000 },
  ],
  trades: [
    { id: 1, date: "2026-03-25", asset: "BTC", action: "BUY", price: "68400", quantity: "0.5", pnl: "-120" },
    { id: 2, date: "2026-03-24", asset: "ETH", action: "SELL", price: "3800", quantity: "5.0", pnl: "450" },
    { id: 3, date: "2026-03-22", asset: "SOL", action: "BUY", price: "185", quantity: "50", pnl: "120" },
    { id: 4, date: "2026-03-20", asset: "BTC", action: "SELL", price: "70000", quantity: "1.2", pnl: "1450" },
  ]
};

export const fetchMetrics = async () => {
  try {
    const res = await fetch("/api/metrics");
    if (!res.ok) throw new Error("API not available");
    const data = await res.json();
    // Map backend response shape to what the UI expects
    return {
      apy: data.apy_percent,
      totalProfit: data.total_profit,
      maxDrawdown: data.max_drawdown_percent,
      sharpeRatio: data.sharpe_ratio,
    };
  } catch (err) {
    console.warn("Using mock metrics data.");
    return mockData.metrics;
  }
};

export const fetchEquity = async () => {
  try {
    const res = await fetch("/api/equity");
    if (!res.ok) throw new Error("API not available");
    const data = await res.json();
    // Map backend dict { "YYYY-MM-DD": value } to UI array [{ date, value }]
    return Object.entries(data).map(([date, value]) => ({ date, value }));
  } catch (err) {
    console.warn("Using mock equity data.");
    return mockData.equity;
  }
};

export const fetchTrades = async () => {
  try {
    const res = await fetch("/api/trades");
    if (!res.ok) throw new Error("API not available");
    const data = await res.json();
    // Ensure ids exist for the React keys
    return data.map((trade, idx) => ({ ...trade, id: idx + 1 }));
  } catch (err) {
    console.warn("Using mock trades data.");
    return mockData.trades;
  }
};
