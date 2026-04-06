import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl">
      <p className="text-gray-500 text-xs font-mono mb-1">{label}</p>
      <p className={`font-bold text-lg data-value ${v < 0 ? 'text-semantic-loss' : 'text-accent-green'}`}>
        {v === 0 ? 'No drawdown' : `${v.toFixed(1)}%`}
      </p>
    </div>
  );
};

const DrawdownChart = ({ data }) => {
  const maxDD = Math.min(...data.map((d) => d.dd));
  return (
    <div className="glass p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-semantic-loss/10 border border-semantic-loss/20">
            <TrendingDown size={16} className="text-semantic-loss" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Drawdown Curve</h3>
            <p className="text-gray-600 text-xs font-mono">Peak-to-trough decline over time</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Max DD</p>
          <p className="text-semantic-loss font-bold data-value text-lg">{maxDD.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}%`} width={44} domain={['dataMin', 0]} />
            <Tooltip content={<Tip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="dd" stroke="#F43F5E" strokeWidth={2.5}
              fill="url(#ddGrad)" fillOpacity={1} dot={false}
              activeDot={{ r: 5, fill: '#F43F5E', stroke: '#0A0A0B', strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-gray-600">Avg Drawdown: {(data.reduce((s,d)=>s+d.dd,0)/data.length).toFixed(1)}%</span>
        <span className="text-[10px] font-mono text-gray-600">Recovery periods: {data.filter(d=>d.dd===0).length} months</span>
      </div>
    </div>
  );
};

export default DrawdownChart;
