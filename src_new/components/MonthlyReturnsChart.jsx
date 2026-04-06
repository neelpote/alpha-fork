import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { BarChart2 } from 'lucide-react';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl">
      <p className="text-gray-500 text-xs font-mono mb-1">{label}</p>
      <p className={`font-bold text-xl data-value ${v >= 0 ? 'text-accent-green' : 'text-semantic-loss'}`}>
        {v >= 0 ? '+' : ''}{v}%
      </p>
    </div>
  );
};

const MonthlyReturnsChart = ({ data }) => {
  const positive = data.filter((d) => d.pct > 0).length;
  const best     = Math.max(...data.map((d) => d.pct));
  const worst    = Math.min(...data.map((d) => d.pct));

  return (
    <div className="glass p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
            <BarChart2 size={16} className="text-accent-green" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Monthly Returns</h3>
            <p className="text-gray-600 text-xs font-mono">2025 · AlphaVault Strategy</p>
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] font-mono text-gray-600">Best</p>
            <p className="text-accent-green font-bold data-value">+{best}%</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-gray-600">Worst</p>
            <p className="text-semantic-loss font-bold data-value">{worst}%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}%`} width={40} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="pct" position="top"
                formatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                style={{ fill: '#6B7280', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              {data.map((e, i) => (
                <Cell key={i} fill={e.pct >= 0 ? '#10B981' : '#F43F5E'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
        <span className="text-accent-green text-sm font-medium">{positive} positive months</span>
        <span className="text-semantic-loss text-sm font-medium">{data.length - positive} negative months</span>
      </div>
    </div>
  );
};

export default MonthlyReturnsChart;
