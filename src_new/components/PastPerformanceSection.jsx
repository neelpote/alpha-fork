import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

const GradientBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none"
    style={{ background: 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)' }} />
);

// ── Data ──────────────────────────────────────────────────────────────────────

const cumulativeData = [
  { month: "Jan '25", alphavault: 0,    btc: 0,    sp500: 0 },
  { month: "Feb '25", alphavault: 4.2,  btc: 8.1,  sp500: 1.8 },
  { month: "Mar '25", alphavault: 9.1,  btc: 5.3,  sp500: 3.1 },
  { month: "Apr '25", alphavault: 12.4, btc: -2.1, sp500: 2.4 },
  { month: "May '25", alphavault: 18.7, btc: 3.4,  sp500: 4.0 },
  { month: "Jun '25", alphavault: 15.2, btc: -6.8, sp500: 1.2 },
  { month: "Jul '25", alphavault: 22.5, btc: 4.2,  sp500: 5.5 },
  { month: "Aug '25", alphavault: 28.3, btc: 11.5, sp500: 6.8 },
  { month: "Sep '25", alphavault: 24.8, btc: 7.3,  sp500: 4.2 },
  { month: "Oct '25", alphavault: 31.9, btc: 14.2, sp500: 8.1 },
  { month: "Nov '25", alphavault: 38.4, btc: 22.1, sp500: 9.4 },
  { month: "Dec '25", alphavault: 42.0, btc: 18.6, sp500: 10.2 },
  { month: "Jan '26", alphavault: 48.7, btc: 24.5, sp500: 12.1 },
  { month: "Feb '26", alphavault: 55.3, btc: 19.8, sp500: 11.5 },
  { month: "Mar '26", alphavault: 61.2, btc: 28.4, sp500: 13.8 },
];

const monthlyReturns = [
  { month: 'Jan', pct: 4.2 },
  { month: 'Feb', pct: 4.7 },
  { month: 'Mar', pct: 3.6 },
  { month: 'Apr', pct: -2.9 },
  { month: 'May', pct: 6.0 },
  { month: 'Jun', pct: -3.2 },
  { month: 'Jul', pct: 6.8 },
  { month: 'Aug', pct: 5.1 },
  { month: 'Sep', pct: -3.1 },
  { month: 'Oct', pct: 7.3 },
  { month: 'Nov', pct: 6.1 },
  { month: 'Dec', pct: 3.5 },
];

const stats = [
  { label: 'Total Return', value: '+61.2%', color: 'text-accent-green'  },
  { label: 'vs BTC',       value: '+32.8%', color: 'text-accent-blue'   },
  { label: 'vs S&P 500',   value: '+47.4%', color: 'text-accent-indigo' },
  { label: 'Max Drawdown', value: '-8.4%',  color: 'text-semantic-loss' },
  { label: 'Sharpe Ratio', value: '2.1',    color: 'text-yellow-400'    },
  { label: 'Win Rate',     value: '67%',    color: 'text-accent-green'  },
];

// ── Shared tooltip styles ────────────────────────────────────────────────────

const CumulativeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl p-4 shadow-2xl space-y-1.5">
      <p className="text-gray-400 text-xs font-mono mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-bold">{p.value > 0 ? '+' : ''}{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const MonthlyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="glass border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-gray-400 text-xs font-mono mb-1">{label}</p>
      <p className={`font-bold text-lg ${v >= 0 ? 'text-accent-green' : 'text-semantic-loss'}`}>
        {v >= 0 ? '+' : ''}{v}%
      </p>
    </div>
  );
};

// ── Chart sub-components ─────────────────────────────────────────────────────

const CumulativeChart = () => (
  <div className="glass p-6 rounded-2xl flex flex-col h-full border border-white/5 hover:border-white/10 transition-colors duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
        <TrendingUp size={18} className="text-accent-blue" />
      </div>
      <div>
        <h3 className="text-white font-bold text-base">Cumulative Returns</h3>
        <p className="text-gray-500 text-xs">Jan 2025 – Mar 2026 · vs benchmarks</p>
      </div>
    </div>

    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBTC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CumulativeTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>}
          />
          <Area type="monotone" dataKey="alphavault" name="AlphaVault" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradAV)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 3 }} />
          <Area type="monotone" dataKey="btc"         name="BTC"        stroke="#f59e0b" strokeWidth={1.5} fill="url(#gradBTC)" dot={false} strokeDasharray="4 3" activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="sp500"       name="S&P 500"    stroke="#8b5cf6" strokeWidth={1.5} fill="none"          dot={false} strokeDasharray="2 3" activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const MonthlyReturnsChart = () => (
  <div className="glass p-6 rounded-2xl flex flex-col h-full border border-white/5 hover:border-white/10 transition-colors duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
        <BarChart2 size={18} className="text-accent-green" />
      </div>
      <div>
        <h3 className="text-white font-bold text-base">Monthly Returns</h3>
        <p className="text-gray-500 text-xs">2025 · AlphaVault Strategy</p>
      </div>
    </div>

    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyReturns} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
          <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="pct" name="Return" radius={[4, 4, 0, 0]}>
            {monthlyReturns.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.pct >= 0 ? '#10b981' : '#ef4444'}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Positive / negative summary */}
    <div className="flex justify-between mt-4 pt-4 border-t border-white/5 text-sm">
      <span className="text-accent-green font-medium">
        {monthlyReturns.filter(m => m.pct > 0).length} positive months
      </span>
      <span className="text-semantic-loss font-medium">
        {monthlyReturns.filter(m => m.pct < 0).length} negative months
      </span>
    </div>
  </div>
);

// ── Main Section ─────────────────────────────────────────────────────────────

const PastPerformanceSection = () => {
  return (
    <section className="py-24 px-6 lg:px-10 border-t border-white/5 relative overflow-hidden">
      <GradientBg />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/50 via-transparent to-background/50 pointer-events-none" />

      <div className="max-w-site mx-auto relative z-10">

        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="badge-blue inline-flex items-center gap-2 mb-4">
            <Activity size={12} />
            ZK-Verified Historical Data
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Proven Track Record
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            15 months of audited, on-chain verified performance. Every number is backed by a Zero-Knowledge proof — not just a spreadsheet.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass p-4 rounded-xl text-center border border-white/5 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CumulativeChart />
          <MonthlyReturnsChart />
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-600 text-xs mt-8 font-mono">
          Past performance is not indicative of future results. All figures verified via ZK proofs on Ethereum Sepolia testnet.
        </p>
      </div>
    </section>
  );
};

export default PastPerformanceSection;
