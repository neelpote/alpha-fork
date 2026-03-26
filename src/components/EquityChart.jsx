import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-xl border border-white/10 shadow-2xl">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-accent-blue font-bold text-xl">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const EquityChart = ({ data }) => {
  return (
    <div className="glass p-6 rounded-2xl w-full h-[500px] flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6">Portfolio Equity Curve</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{ fill: '#64748b' }} 
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 8, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EquityChart;
