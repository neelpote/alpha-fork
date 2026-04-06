import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, X } from 'lucide-react';

const PRESETS = [
  { label: 'All',    days: null     },
  { label: '7D',     days: 7        },
  { label: '30D',    days: 30       },
  { label: '90D',    days: 90       },
  { label: 'Custom', days: 'custom' },
];

const dateInputCls =
  'bg-white/5 border border-white/10 text-white text-[11px] font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent-blue/60 transition-all [color-scheme:dark] w-[118px]';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl">
      <p className="text-gray-500 text-xs font-mono mb-1">{label}</p>
      <p className="text-accent-blue font-bold text-lg data-value">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

const EquityChart = ({ data }) => {
  const [preset, setPreset]         = useState('All');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');

  const { minDate, maxDate } = useMemo(() => {
    if (!data.length) return { minDate: '', maxDate: '' };
    const sorted = [...data].map((d) => d.date).sort();
    return { minDate: sorted[0], maxDate: sorted[sorted.length - 1] };
  }, [data]);

  const { fromDate, toDate } = useMemo(() => {
    if (preset === 'Custom') return { fromDate: customFrom || null, toDate: customTo || null };
    if (preset === 'All' || !data.length) return { fromDate: null, toDate: null };
    const days = PRESETS.find((p) => p.label === preset)?.days;
    if (!days) return { fromDate: null, toDate: null };
    const dates = data.map((d) => new Date(d.date)).filter((d) => !isNaN(d));
    const latest = new Date(Math.max(...dates));
    const cutoff = new Date(latest);
    cutoff.setDate(cutoff.getDate() - days);
    return {
      fromDate: cutoff.toISOString().slice(0, 10),
      toDate:   latest.toISOString().slice(0, 10),
    };
  }, [preset, customFrom, customTo, data]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchFrom = !fromDate || d.date >= fromDate;
      const matchTo   = !toDate   || d.date <= toDate;
      return matchFrom && matchTo;
    });
  }, [data, fromDate, toDate]);

  // compute % change for the filtered window
  const pctChange = useMemo(() => {
    if (filtered.length < 2) return null;
    const first = filtered[0].value;
    const last  = filtered[filtered.length - 1].value;
    return (((last - first) / first) * 100).toFixed(2);
  }, [filtered]);

  const clearCustom = () => { setCustomFrom(''); setCustomTo(''); setPreset('All'); };

  return (
    <div className="glass p-6 rounded-2xl w-full h-[480px] md:h-[580px] flex flex-col">

      {/* ── Header ── */}
      <div className="mb-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
              <TrendingUp size={16} className="text-accent-blue" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Portfolio Equity Curve</h3>
              <p className="text-gray-600 text-xs font-mono">ZK-Verified · {filtered.length} data points</p>
            </div>
          </div>
          {pctChange !== null && (
            <span className={`text-xs font-bold data-value px-3 py-1 rounded-full border ${
              parseFloat(pctChange) >= 0
                ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                : 'bg-semantic-loss/10 border-semantic-loss/20 text-semantic-loss'
            }`}>
              {parseFloat(pctChange) >= 0 ? '+' : ''}{pctChange}%
            </span>
          )}
        </div>

        {/* Preset pills */}
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

        {/* Custom date inputs */}
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
                title="Clear"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Active range display */}
        {preset !== 'All' && preset !== 'Custom' && fromDate && toDate && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-600">Range:</span>
            <span className="text-[10px] font-mono text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded-md">
              {fromDate} → {toDate}
            </span>
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            {filtered.length > 0 && (
              <ReferenceLine
                y={filtered[0].value}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#equityGrad)"
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#0A0A0B', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EquityChart;
