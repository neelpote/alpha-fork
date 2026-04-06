import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-3 rounded-xl shadow-2xl space-y-1.5">
      <p className="text-gray-500 text-xs font-mono mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400 text-xs font-mono">{p.name}:</span>
          <span className="text-white font-bold text-sm data-value">{p.value.toFixed(2)}{p.dataKey === 'volatility' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

const VIEWS = ['Both', 'Sharpe', 'Volatility'];

const RollingMetricsChart = ({ data }) => {
  const [view, setView] = useState('Both');
  const avgSharpe = (data.reduce((s, d) => s + d.sharpe, 0) / data.length).toFixed(2);
  const avgVol    = (data.reduce((s, d) => s + d.volatility, 0) / data.length).toFixed(1);

  return (
    <div className="glass p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20">
            <Activity size={16} className="text-accent-indigo" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Rolling Sharpe & Volatility</h3>
            <p className="text-gray-600 text-xs font-mono">30-day rolling window</p>
          </div>
        </div>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                view === v ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                           : 'text-gray-600 hover:text-gray-400 border border-transparent'
              }`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-blue/8 border border-accent-blue/15">
          <div className="w-2 h-2 rounded-full bg-accent-blue" />
          <span className="text-[10px] font-mono text-gray-500">Avg Sharpe</span>
          <span className="text-accent-blue font-bold text-sm data-value">{avgSharpe}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/8 border border-yellow-500/15">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-[10px] font-mono text-gray-500">Avg Vol</span>
          <span className="text-yellow-400 font-bold text-sm data-value">{avgVol}%</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<Tip />} />
            {(view === 'Both' || view === 'Sharpe') && (
              <Line type="monotone" dataKey="sharpe" name="Sharpe" stroke="#3B82F6" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#0A0A0B', strokeWidth: 3 }} />
            )}
            {(view === 'Both' || view === 'Volatility') && (
              <Line type="monotone" dataKey="volatility" name="Volatility %" stroke="#F59E0B" strokeWidth={2}
                strokeDasharray="5 3" dot={false} activeDot={{ r: 4, fill: '#F59E0B' }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RollingMetricsChart;
