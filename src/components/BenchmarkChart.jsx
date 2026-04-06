import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl space-y-1.5">
      <p className="text-gray-500 text-xs font-mono mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400 font-mono">{p.name}:</span>
          <span className="text-white font-bold data-value">{p.value > 0 ? '+' : ''}{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const SERIES = [
  { key: 'alphavault', name: 'AlphaVault', color: '#3B82F6', gradId: 'bGradAV', dashed: false },
  { key: 'btc',        name: 'BTC',        color: '#F59E0B', gradId: 'bGradBTC', dashed: true  },
  { key: 'sp500',      name: 'S&P 500',    color: '#8B5CF6', gradId: 'bGradSP',  dashed: true  },
];

const BenchmarkChart = ({ data }) => {
  const last = data[data.length - 1] ?? {};
  return (
    <div className="glass p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
            <TrendingUp size={16} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Benchmark Comparison</h3>
            <p className="text-gray-600 text-xs font-mono">Cumulative returns vs BTC & S&P 500</p>
          </div>
        </div>
        <div className="flex gap-3">
          {SERIES.map((s) => (
            <div key={s.key} className="text-right">
              <p className="text-[10px] font-mono text-gray-600">{s.name}</p>
              <p className="font-bold data-value text-sm" style={{ color: s.color }}>
                {last[s.key] !== undefined ? `+${last[s.key]}%` : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={s.dashed ? 0.08 : 0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}%`} width={44} />
            <Tooltip content={<Tip />} />
            <Legend iconType="circle" iconSize={8}
              formatter={(v) => <span className="text-gray-400 text-xs font-mono">{v}</span>} />
            {SERIES.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
                stroke={s.color} strokeWidth={s.dashed ? 1.5 : 2.5}
                strokeDasharray={s.dashed ? '5 3' : undefined}
                fill={`url(#${s.gradId})`} fillOpacity={1} dot={false}
                activeDot={{ r: s.dashed ? 3 : 5, fill: s.color, stroke: '#0A0A0B', strokeWidth: 2 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BenchmarkChart;
