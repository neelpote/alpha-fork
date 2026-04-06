import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── Tooltip ───────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const profit = val >= 0;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl min-w-[130px]">
      <p className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-widest">{label}</p>
      <p className={`font-bold text-xl data-value ${profit ? 'text-accent-green' : 'text-semantic-loss'}`}>
        {profit ? '+' : '-'}${Math.abs(val).toLocaleString()}
      </p>
      <p className="text-gray-600 text-[10px] font-mono mt-1">
        {profit ? 'Profit' : 'Loss'} · Last 30 days
      </p>
    </div>
  );
};

// ── Custom bar label ──────────────────────────────────────────────────────────
const BarLabel = ({ x, y, width, value }) => {
  if (value === undefined || value === null) return null;
  const profit = value >= 0;
  const label  = `${profit ? '+' : '-'}$${Math.abs(value) >= 1000
    ? `${(Math.abs(value) / 1000).toFixed(1)}k`
    : Math.abs(value).toFixed(0)}`;
  return (
    <text
      x={x + width / 2}
      y={profit ? y - 6 : y + 16}
      textAnchor="middle"
      fill={profit ? '#10B981' : '#F43F5E'}
      fontSize={11}
      fontFamily="JetBrains Mono, monospace"
      fontWeight="700"
    >
      {label}
    </text>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AssetPerformanceChart = ({ data }) => {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.pnl - a.pnl),
    [data]
  );

  const totalPnl   = useMemo(() => data.reduce((s, d) => s + d.pnl, 0), [data]);
  const bestAsset  = useMemo(() => [...data].sort((a, b) => b.pnl - a.pnl)[0],  [data]);
  const worstAsset = useMemo(() => [...data].sort((a, b) => a.pnl - b.pnl)[0], [data]);
  const winners    = data.filter((d) => d.pnl > 0).length;

  // dynamic bar size — wider when fewer assets
  const barSize = Math.min(64, Math.max(32, Math.floor(480 / (sorted.length || 1)) - 20));

  return (
    <div className="glass p-6 rounded-2xl w-full flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
            <BarChart2 size={16} className="text-accent-green" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Asset P&L Breakdown</h3>
            <p className="text-gray-600 text-xs font-mono">Last 30 days · {data.length} assets</p>
          </div>
        </div>
        <div className={`text-sm font-bold data-value px-3 py-1 rounded-full border ${
          totalPnl >= 0
            ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
            : 'bg-semantic-loss/10 border-semantic-loss/20 text-semantic-loss'
        }`}>
          {totalPnl >= 0 ? '+' : '-'}${Math.abs(totalPnl).toLocaleString()} total
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Best Asset',
            value: bestAsset ? `${bestAsset.asset}` : '—',
            sub:   bestAsset ? `+$${bestAsset.pnl.toLocaleString()}` : '',
            icon:  TrendingUp,
            color: 'text-accent-green',
            bg:    'bg-accent-green/5 border-accent-green/10',
          },
          {
            label: 'Worst Asset',
            value: worstAsset ? `${worstAsset.asset}` : '—',
            sub:   worstAsset ? `-$${Math.abs(worstAsset.pnl).toLocaleString()}` : '',
            icon:  TrendingDown,
            color: 'text-semantic-loss',
            bg:    'bg-semantic-loss/5 border-semantic-loss/10',
          },
          {
            label: 'Profitable',
            value: `${winners} / ${data.length}`,
            sub:   `${data.length ? Math.round((winners / data.length) * 100) : 0}% win rate`,
            icon:  BarChart2,
            color: 'text-accent-blue',
            bg:    'bg-accent-blue/5 border-accent-blue/10',
          },
          {
            label: 'Net PnL',
            value: `${totalPnl >= 0 ? '+' : '-'}$${Math.abs(totalPnl).toLocaleString()}`,
            sub:   totalPnl >= 0 ? 'Net profit' : 'Net loss',
            icon:  Minus,
            color: totalPnl >= 0 ? 'text-accent-green' : 'text-semantic-loss',
            bg:    totalPnl >= 0 ? 'bg-accent-green/5 border-accent-green/10' : 'bg-semantic-loss/5 border-semantic-loss/10',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl p-3 border ${bg} flex flex-col gap-1`}>
            <div className="flex items-center gap-1.5">
              <Icon size={11} className={color} />
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{label}</span>
            </div>
            <p className={`text-base font-bold data-value ${color}`}>{value}</p>
            {sub && <p className="text-[10px] font-mono text-gray-600">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Bar chart ── */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            margin={{ top: 28, right: 16, left: 0, bottom: 8 }}
            barSize={barSize}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="asset"
              tick={{ fill: '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const abs = Math.abs(v);
                const sign = v < 0 ? '-' : '';
                return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(1)}k` : `${sign}$${abs}`;
              }}
              width={56}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}
            />
            {/* Zero reference line */}
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeDasharray="0"
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
              <LabelList content={<BarLabel />} />
              {sorted.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'}
                  fillOpacity={entry.pnl >= 0 ? 0.85 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Asset legend row ── */}
      <div className="flex flex-wrap gap-3 pt-1 border-t border-white/5">
        {sorted.map((d) => (
          <div key={d.asset} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: d.pnl >= 0 ? '#10B981' : '#F43F5E' }}
            />
            <span className="text-xs font-mono text-gray-400">{d.asset}</span>
            <span className={`text-xs font-bold data-value ${d.pnl >= 0 ? 'text-accent-green' : 'text-semantic-loss'}`}>
              {d.pnl >= 0 ? '+' : '-'}${Math.abs(d.pnl).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetPerformanceChart;
