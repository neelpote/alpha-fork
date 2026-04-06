import React, { useState, useMemo } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Filter, Calendar, X } from 'lucide-react';

const ASSET_COLORS = {
  BTC: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  ETH: { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20'   },
  SOL: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};
const assetStyle = (a) => ASSET_COLORS[a] ?? { bg: 'bg-white/5', text: 'text-gray-300', border: 'border-white/10' };

const PRESETS = [
  { label: 'All',  days: null },
  { label: '7D',   days: 7    },
  { label: '30D',  days: 30   },
  { label: '90D',  days: 90   },
  { label: 'Custom', days: 'custom' },
];

// shared date input style
const dateInputCls =
  'bg-white/5 border border-white/10 text-white text-[11px] font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent-blue/60 transition-all [color-scheme:dark] w-[118px]';

const TradesTable = ({ trades }) => {
  const [sideFilter, setSideFilter]   = useState('ALL');
  const [preset, setPreset]           = useState('All');
  const [customFrom, setCustomFrom]   = useState('');
  const [customTo, setCustomTo]       = useState('');

  // derive min/max dates from data for input bounds
  const { minDate, maxDate } = useMemo(() => {
    if (!trades.length) return { minDate: '', maxDate: '' };
    const sorted = [...trades].map((t) => t.date).sort();
    return { minDate: sorted[0], maxDate: sorted[sorted.length - 1] };
  }, [trades]);

  // compute from/to based on active preset
  const { fromDate, toDate } = useMemo(() => {
    if (preset === 'Custom') {
      return { fromDate: customFrom || null, toDate: customTo || null };
    }
    if (preset === 'All' || !trades.length) return { fromDate: null, toDate: null };
    const days = PRESETS.find((p) => p.label === preset)?.days;
    if (!days) return { fromDate: null, toDate: null };
    const dates = trades.map((t) => new Date(t.date)).filter((d) => !isNaN(d));
    const latest = new Date(Math.max(...dates));
    const cutoff = new Date(latest);
    cutoff.setDate(cutoff.getDate() - days);
    return {
      fromDate: cutoff.toISOString().slice(0, 10),
      toDate:   latest.toISOString().slice(0, 10),
    };
  }, [preset, customFrom, customTo, trades]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchSide = sideFilter === 'ALL' || t.action === sideFilter;
      const matchFrom = !fromDate || t.date >= fromDate;
      const matchTo   = !toDate   || t.date <= toDate;
      return matchSide && matchFrom && matchTo;
    });
  }, [trades, sideFilter, fromDate, toDate]);

  const totalPnl = filtered.reduce((s, t) => s + parseFloat(t.pnl), 0);
  const wins     = filtered.filter((t) => parseFloat(t.pnl) > 0).length;
  const winRate  = filtered.length ? Math.round((wins / filtered.length) * 100) : 0;

  const clearCustom = () => { setCustomFrom(''); setCustomTo(''); setPreset('All'); };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[480px] md:h-[580px]">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5 space-y-3 shrink-0">

        {/* Title + badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-base">Recent Trades</h3>
            <span className="text-gray-600 text-xs font-mono">({filtered.length})</span>
          </div>
          <span className="badge-green text-[10px] flex items-center gap-1">
            <ShieldCheck size={10} />
            ZK Verified
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'PnL',      value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toFixed(2)}`, color: totalPnl >= 0 ? 'text-accent-green' : 'text-semantic-loss' },
            { label: 'Win Rate', value: `${winRate}%`,    color: 'text-accent-blue' },
            { label: 'Trades',   value: filtered.length,  color: 'text-white'       },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.03] rounded-xl px-3 py-2 border border-white/5">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">{label}</p>
              <p className={`text-sm font-bold data-value ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Date preset pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar size={11} className="text-gray-600 shrink-0 mr-0.5" />
          {PRESETS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setPreset(label)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                preset === label
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent hover:border-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs — shown when Custom is active */}
        {preset === 'Custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-gray-600">From</span>
              <input
                type="date"
                value={customFrom}
                min={minDate}
                max={customTo || maxDate}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={dateInputCls}
              />
            </div>
            <span className="text-gray-700 text-xs">→</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-gray-600">To</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || minDate}
                max={maxDate}
                onChange={(e) => setCustomTo(e.target.value)}
                className={dateInputCls}
              />
            </div>
            {(customFrom || customTo) && (
              <button
                onClick={clearCustom}
                className="p-1 rounded-lg text-gray-600 hover:text-semantic-loss hover:bg-semantic-loss/10 transition-all"
                title="Clear date filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Active date range display (non-custom) */}
        {preset !== 'All' && preset !== 'Custom' && fromDate && toDate && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-600">Range:</span>
            <span className="text-[10px] font-mono text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded-md">
              {fromDate} → {toDate}
            </span>
          </div>
        )}

        {/* Side filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={11} className="text-gray-600 shrink-0 mr-0.5" />
          {['ALL', 'BUY', 'SELL'].map((f) => (
            <button
              key={f}
              onClick={() => setSideFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                sideFilter === f
                  ? f === 'BUY'  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                  : f === 'SELL' ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                  :                'bg-white/10 text-white border border-white/20'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent hover:border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="grid grid-cols-[88px_50px_46px_1fr_50px_70px] px-4 py-2 border-b border-white/5 shrink-0">
        {['DATE', 'ASSET', 'SIDE', 'PRICE', 'QTY', 'PNL'].map((h, i) => (
          <span key={h} className={`text-[10px] font-mono text-gray-600 uppercase tracking-widest ${i >= 3 ? 'text-right' : ''}`}>
            {h}
          </span>
        ))}
      </div>

      {/* ── Scrollable rows ── */}
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600">
            <Calendar size={24} className="opacity-30" />
            <p className="text-sm font-mono">No trades match filters.</p>
            <button onClick={clearCustom} className="text-xs text-accent-blue hover:underline font-mono">
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((trade, idx) => {
            const pnl    = parseFloat(trade.pnl);
            const profit = pnl >= 0;
            const style  = assetStyle(trade.asset);
            return (
              <div
                key={trade.id ?? idx}
                className="grid grid-cols-[88px_50px_46px_1fr_50px_70px] items-center px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors"
              >
                <span className="text-[11px] font-mono text-gray-500 leading-tight">{trade.date}</span>

                <div>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${style.bg} ${style.text} ${style.border}`}>
                    {trade.asset}
                  </span>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    trade.action === 'BUY' ? 'bg-accent-blue/15 text-accent-blue' : 'bg-accent-indigo/15 text-accent-indigo'
                  }`}>
                    {trade.action === 'BUY' ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {trade.action}
                  </span>
                </div>

                <span className="text-right text-[12px] font-mono text-gray-300">
                  ${parseFloat(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                <span className="text-right text-[11px] font-mono text-gray-500">
                  {parseFloat(trade.quantity).toFixed(2)}
                </span>

                <span className={`text-right text-[12px] font-bold data-value ${profit ? 'text-accent-green' : 'text-semantic-loss'}`}>
                  {profit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-gray-700">
          {filtered.length} of {trades.length} trades
        </span>
        <span className="text-[10px] font-mono text-gray-700">
          {wins}W / {filtered.length - wins}L
        </span>
      </div>
    </div>
  );
};

export default TradesTable;
