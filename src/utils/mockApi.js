/**
 * AlphaVault API client
 * Fetches real data from the Python backend (port 5000).
 * All requests go through Vite's /api proxy in dev,
 * or directly to VITE_API_BASE in production.
 */

// In dev: Vite proxies /api/* → http://localhost:5000/*
// In prod: set VITE_API_BASE=https://your-backend.com
const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}`
  : '';

async function apiFetch(path) {
  // Use /api prefix so Vite proxy handles it in dev
  // If VITE_API_BASE is set (prod), hit it directly
  const url = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}${path}`
    : `/api${path}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

export const fetchMetrics = async () => {
  const data = await apiFetch('/metrics');
  return {
    apy:         String(data.apy_percent),
    totalProfit: String(data.total_profit),
    finalValue:  String(data.final_value),
    maxDrawdown: String(-Math.abs(data.max_drawdown_percent)),
    sharpeRatio: String(data.sharpe_ratio),
    totalTrades: data.total_trades,
    winRate:     data.win_rate_percent,
  };
};

export const fetchEquity = async () => {
  const data = await apiFetch('/equity');
  if (!Array.isArray(data)) {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }
  return data;
};

export const fetchTrades = async () => {
  const data = await apiFetch('/trades');
  return data.map((t, idx) => ({ ...t, id: t.id ?? idx + 1 }));
};

export const fetchAllocation      = () => apiFetch('/allocation');
export const fetchAssetPerformance = () => apiFetch('/asset-performance');
export const fetchRiskMetrics      = () => apiFetch('/risk-metrics');
export const fetchDrawdown         = () => apiFetch('/drawdown');
export const fetchMonthlyReturns   = () => apiFetch('/monthly-returns');
export const fetchRollingMetrics   = () => apiFetch('/rolling-metrics');
export const fetchBenchmark        = () => apiFetch('/benchmark');

export async function fetchContractState() {
  try {
    return await apiFetch('/contract-state');
  } catch {
    return null;
  }
}

export async function fetchInvestorBalance(walletAddress = 'default') {
  try {
    const url = import.meta.env.VITE_API_BASE
      ? `${import.meta.env.VITE_API_BASE}/investor-balance?address=${walletAddress}`
      : `/api/investor-balance?address=${walletAddress}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitProof() {
  const url = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}/submit-proof`
    : `/api/submit-proof`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Proof submission failed');
  return data;
}

// ── Bot Plugin API ────────────────────────────────────────────────────────────

function apiUrl(path) {
  return import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}${path}`
    : `/api${path}`;
}

export async function uploadBot(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(apiUrl('/upload-bot'), { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  return res.json();
}

export async function runBot(filename) {
  const res = await fetch(apiUrl('/run-bot'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) throw new Error(`Run failed: HTTP ${res.status}`);
  return res.json();
}

export async function listBots() {
  const data = await apiFetch('/bots');
  return data.bots ?? [];
}

// ── Live Prices & Bot Status ──────────────────────────────────────────────────

export const fetchLivePrices = () => apiFetch('/live-prices');
export const fetchBotStatus  = () => apiFetch('/bot-status');

/**
 * Start polling live prices and bot status every `intervalMs` (default 10s).
 * Returns a cleanup function — call it to stop polling.
 *
 * @param {(prices: object, status: object) => void} onUpdate
 * @param {number} intervalMs
 */
export function startLivePolling(onUpdate, intervalMs = 10_000) {
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const [priceData, status] = await Promise.all([
        fetchLivePrices(),
        fetchBotStatus(),
      ]);
      if (active) onUpdate(priceData, status);
    } catch (err) {
      // silently ignore — backend may not be running
    }
    if (active) setTimeout(poll, intervalMs);
  }

  poll(); // immediate first fetch
  return () => { active = false; };
}
