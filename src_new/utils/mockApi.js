const API_BASE = import.meta.env.VITE_API_BASE ?? '';

// ── Fallback mock data (used when backend is unreachable) ─────────────────────
const mock = {
  metrics: {
    apy: "24.5",
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
    { id: 1, date: "2026-03-25", asset: "BTC", action: "BUY",  price: "68400", quantity: "0.5", pnl: "-120"  },
    { id: 2, date: "2026-03-24", asset: "ETH", action: "SELL", price: "3800",  quantity: "5.0", pnl: "450"   },
    { id: 3, date: "2026-03-22", asset: "SOL", action: "BUY",  price: "185",   quantity: "50",  pnl: "120"   },
    { id: 4, date: "2026-03-20", asset: "BTC", action: "SELL", price: "70000", quantity: "1.2", pnl: "1450"  },
  ],
  allocation: [
    { name: "BTC",  value: 42 },
    { name: "ETH",  value: 28 },
    { name: "SOL",  value: 15 },
    { name: "AVAX", value: 10 },
    { name: "USDC", value: 5  },
  ],
  assetPerformance: [
    { asset: "BTC",  pnl: 8400  },
    { asset: "ETH",  pnl: 5200  },
    { asset: "SOL",  pnl: 3100  },
    { asset: "AVAX", pnl: -850  },
    { asset: "LINK", pnl: 1450  },
    { asset: "ARB",  pnl: -320  },
  ],
  riskMetrics: {
    winRate: 67, wins: 42, losses: 21,
    profitFactor: 2.4, avgWin: 1280, avgLoss: 530,
  },
  drawdown: [
    { date: "Jan '26", dd: 0 },    { date: "Feb '26", dd: -1.2 },
    { date: "Mar '26", dd: -0.5 }, { date: "Apr '26", dd: -3.1 },
    { date: "May '26", dd: 0 },    { date: "Jun '26", dd: -8.4 },
    { date: "Jul '26", dd: -2.1 }, { date: "Aug '26", dd: 0 },
    { date: "Sep '26", dd: -4.2 }, { date: "Oct '26", dd: -1.0 },
    { date: "Nov '26", dd: 0 },    { date: "Dec '26", dd: -0.8 },
  ],
  monthlyReturns: [
    { month: 'Jan', pct: 4.2 },  { month: 'Feb', pct: 4.7 },
    { month: 'Mar', pct: 3.6 },  { month: 'Apr', pct: -2.9 },
    { month: 'May', pct: 6.0 },  { month: 'Jun', pct: -3.2 },
    { month: 'Jul', pct: 6.8 },  { month: 'Aug', pct: 5.1 },
    { month: 'Sep', pct: -3.1 }, { month: 'Oct', pct: 7.3 },
    { month: 'Nov', pct: 6.1 },  { month: 'Dec', pct: 3.5 },
  ],
  rollingMetrics: [
    { date: "Jan '26", sharpe: 1.8, volatility: 12.4 },
    { date: "Feb '26", sharpe: 2.1, volatility: 11.2 },
    { date: "Mar '26", sharpe: 1.9, volatility: 13.1 },
    { date: "Apr '26", sharpe: 1.4, volatility: 15.8 },
    { date: "May '26", sharpe: 2.3, volatility: 10.5 },
    { date: "Jun '26", sharpe: 1.6, volatility: 14.2 },
    { date: "Jul '26", sharpe: 2.5, volatility: 9.8 },
    { date: "Aug '26", sharpe: 2.8, volatility: 8.9 },
    { date: "Sep '26", sharpe: 2.2, volatility: 11.6 },
    { date: "Oct '26", sharpe: 3.1, volatility: 7.4 },
    { date: "Nov '26", sharpe: 2.9, volatility: 8.2 },
    { date: "Dec '26", sharpe: 2.6, volatility: 9.1 },
  ],
  benchmarkComparison: [
    { date: "Jan '25", alphavault: 0,    btc: 0,    sp500: 0 },
    { date: "Mar '25", alphavault: 9.1,  btc: 5.3,  sp500: 3.1 },
    { date: "Jun '25", alphavault: 15.2, btc: -6.8, sp500: 1.2 },
    { date: "Sep '25", alphavault: 24.8, btc: 7.3,  sp500: 4.2 },
    { date: "Dec '25", alphavault: 42.0, btc: 18.6, sp500: 10.2 },
    { date: "Mar '26", alphavault: 61.2, btc: 28.4, sp500: 13.8 },
  ],
};

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function apiFetch(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}/api${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[mockApi] Backend unavailable for ${path}, using mock data.`, err.message);
    return fallback;
  }
}

// ── Exported fetchers ─────────────────────────────────────────────────────────

/**
 * Backend shape: { apy_percent, total_profit, max_drawdown_percent, sharpe_ratio, ... }
 * UI shape:      { apy, totalProfit, maxDrawdown, sharpeRatio }
 */
export const fetchMetrics = async () => {
  const data = await apiFetch('/metrics', null);
  if (!data) return mock.metrics;
  // Real backend response
  if ('apy_percent' in data) {
    return {
      apy:          String(data.apy_percent),
      totalProfit:  String(data.total_profit),
      maxDrawdown:  String(-Math.abs(data.max_drawdown_percent)),
      sharpeRatio:  String(data.sharpe_ratio),
    };
  }
  // Already in UI shape (shouldn't happen but safe)
  return data;
};

/**
 * Backend shape: [{ date, value }, ...]  (server already converts dict → array)
 */
export const fetchEquity = async () => {
  const data = await apiFetch('/equity', null);
  if (!data) return mock.equity;
  // If backend returns a plain object { "date": value } (old format)
  if (!Array.isArray(data)) {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }
  return data;
};

/**
 * Backend shape: [{ date, asset, action, price, quantity, pnl, id }, ...]
 */
export const fetchTrades = async () => {
  const data = await apiFetch('/trades', null);
  if (!data) return mock.trades;
  return data.map((t, idx) => ({ ...t, id: t.id ?? idx + 1 }));
};

/**
 * Backend shape: [{ name, value }, ...]  (percentage per asset)
 */
export const fetchAllocation = async () => {
  return apiFetch('/allocation', mock.allocation);
};

/**
 * Backend shape: [{ asset, pnl }, ...]
 */
export const fetchAssetPerformance = async () => {
  return apiFetch('/asset-performance', mock.assetPerformance);
};

/**
 * Backend shape: { winRate, wins, losses, profitFactor, avgWin, avgLoss }
 */
export const fetchRiskMetrics = async () => {
  return apiFetch('/risk-metrics', mock.riskMetrics);
};

export const fetchDrawdown        = async () => apiFetch('/drawdown',         mock.drawdown);
export const fetchMonthlyReturns  = async () => apiFetch('/monthly-returns',  mock.monthlyReturns);
export const fetchRollingMetrics  = async () => apiFetch('/rolling-metrics',  mock.rollingMetrics);
export const fetchBenchmark       = async () => apiFetch('/benchmark',        mock.benchmarkComparison);
