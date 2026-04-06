import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from 'recharts';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';
import SceneBackground from '../components/SceneBackground';

// ── Data ──────────────────────────────────────────────────────────────────────
const equityData = [
  { date: "Jan '25", value: 1000 },  { date: "Feb '25", value: 1042 },
  { date: "Mar '25", value: 1091 },  { date: "Apr '25", value: 1124 },
  { date: "May '25", value: 1187 },  { date: "Jun '25", value: 1152 },
  { date: "Jul '25", value: 1225 },  { date: "Aug '25", value: 1283 },
  { date: "Sep '25", value: 1248 },  { date: "Oct '25", value: 1319 },
  { date: "Nov '25", value: 1384 },  { date: "Dec '25", value: 1420 },
  { date: "Jan '26", value: 1487 },  { date: "Feb '26", value: 1553 },
  { date: "Mar '26", value: 1612 },
];

const monthlyPnl = [
  { month: 'Jan', pnl: 42 },  { month: 'Feb', pnl: 47 },
  { month: 'Mar', pnl: 36 },  { month: 'Apr', pnl: -29 },
  { month: 'May', pnl: 60 },  { month: 'Jun', pnl: -32 },
  { month: 'Jul', pnl: 68 },  { month: 'Aug', pnl: 51 },
  { month: 'Sep', pnl: -31 }, { month: 'Oct', pnl: 73 },
  { month: 'Nov', pnl: 61 },  { month: 'Dec', pnl: 35 },
];

const drawdownData = [
  { date: "Jan '25", dd: 0 },   { date: "Feb '25", dd: -1.2 },
  { date: "Mar '25", dd: -0.5 },{ date: "Apr '25", dd: -3.1 },
  { date: "May '25", dd: 0 },   { date: "Jun '25", dd: -8.4 },
  { date: "Jul '25", dd: -2.1 },{ date: "Aug '25", dd: 0 },
  { date: "Sep '25", dd: -4.2 },{ date: "Oct '25", dd: -1.0 },
  { date: "Nov '25", dd: 0 },   { date: "Dec '25", dd: -0.8 },
  { date: "Jan '26", dd: 0 },   { date: "Feb '26", dd: -1.5 },
  { date: "Mar '26", dd: 0 },
];

const assetPnl = [
  { asset: 'BTC', pnl: 8400 }, { asset: 'ETH', pnl: 5200 },
  { asset: 'SOL', pnl: 3100 }, { asset: 'AVAX', pnl: -850 },
  { asset: 'LINK', pnl: 1450 },{ asset: 'ARB', pnl: -320 },
];

const kpis = [
  { label: 'Total Return',   value: '+61.2%', color: 'text-accent-green',  sub: '15 months' },
  { label: 'Sharpe Ratio',   value: '2.1',    color: 'text-accent-blue',   sub: 'Risk-adjusted' },
  { label: 'Max Drawdown',   value: '-8.4%',  color: 'text-semantic-loss', sub: 'Jun 2025' },
  { label: 'Win Rate',       value: '67%',    color: 'text-accent-green',  sub: '42W / 21L' },
  { label: 'Profit Factor',  value: '2.4×',   color: 'text-accent-indigo', sub: 'Gross P/L' },
  { label: 'Avg Monthly',    value: '+4.1%',  color: 'text-accent-green',  sub: 'Per month' },
];

// ── Tooltips ──────────────────────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl">
      <p className="text-gray-500 text-xs font-mono mb-1">{label}</p>
      <p className={`font-bold text-lg data-value ${val >= 0 ? 'text-accent-green' : 'text-semantic-loss'}`}>
        {val >= 0 ? '+' : ''}{prefix}{val}{suffix}
      </p>
    </div>
  );
};

const TABS = ['Equity', 'Monthly PnL', 'Drawdown', 'Asset P&L'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Equity');

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <SceneBackground variant="subtle" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/70 via-background/45 to-background/70 pointer-events-none" />

      <div className="relative z-10 max-w-site mx-auto px-6 lg:px-10 py-20 space-y-12">

        {/* ── Header ── */}
        <div className="space-y-3">
          <div className="badge-blue w-fit">Analytics</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Performance <span className="text-gradient">Analytics</span>
              </h1>
              <p className="text-gray-400 mt-2">15 months of ZK-verified trading data. Every figure is on-chain provable.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-green/10 border border-accent-green/20">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-accent-green text-sm font-mono">ZK Verified · Live</span>
            </div>
          </div>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(({ label, value, color, sub }) => (
            <div key={label} className="glass-hover p-5 rounded-2xl text-center">
              <p className={`text-2xl font-bold data-value ${color} mb-1`}>{value}</p>
              <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
              <p className="text-gray-600 text-xs font-mono">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Chart tabs ── */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-accent-blue border-accent-blue bg-accent-blue/5'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/3'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'Equity' ? (
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={52} />
                  <Tooltip content={<GlassTooltip prefix="$" />} />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#0A0A0B', strokeWidth: 3 }} />
                </AreaChart>
              ) : activeTab === 'Monthly PnL' ? (
                <BarChart data={monthlyPnl} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={52} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                  <Tooltip content={<GlassTooltip prefix="$" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="pnl" radius={[5, 5, 0, 0]}>
                    {monthlyPnl.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#10B981' : '#F43F5E'} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              ) : activeTab === 'Drawdown' ? (
                <AreaChart data={drawdownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={52} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  <Tooltip content={<GlassTooltip suffix="%" />} />
                  <Area type="monotone" dataKey="dd" stroke="#F43F5E" strokeWidth={2} fill="url(#ddGrad)" dot={false} activeDot={{ r: 5, fill: '#F43F5E', stroke: '#0A0A0B', strokeWidth: 3 }} />
                </AreaChart>
              ) : (
                <BarChart data={assetPnl} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="asset" tick={{ fill: '#4B5563', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 600 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${Math.abs(v / 1000).toFixed(1)}k`} width={52} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                  <Tooltip content={<GlassTooltip prefix="$" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {assetPnl.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#10B981' : '#F43F5E'} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom stats grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Best Month',  value: '+$73',  sub: 'October 2025',  color: 'text-accent-green',  icon: TrendingUp },
            { title: 'Worst Month', value: '-$32',  sub: 'June 2025',     color: 'text-semantic-loss', icon: Activity   },
            { title: 'Avg Monthly', value: '+$41',  sub: 'Over 12 months',color: 'text-accent-blue',   icon: BarChart2  },
          ].map(({ title, value, sub, color, icon: Icon }) => (
            <div key={title} className="glass-hover p-6 rounded-2xl flex items-center gap-5">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">{title}</p>
                <p className={`text-2xl font-bold data-value ${color}`}>{value}</p>
                <p className="text-gray-600 text-xs font-mono mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs font-mono">
          All figures ZK-verified on Ethereum Sepolia testnet · Past performance is not indicative of future results
        </p>
      </div>
    </div>
  );
}
