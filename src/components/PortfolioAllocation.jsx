import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl shadow-2xl">
      <p className="text-white font-bold text-sm font-mono">{payload[0].name}</p>
      <p className="text-gray-400 text-xs font-mono">{payload[0].value}%</p>
    </div>
  );
};

const PortfolioAllocation = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="glass p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20">
            <PieIcon size={16} className="text-accent-indigo" />
          </div>
          <h3 className="text-white font-bold text-base">Portfolio Allocation</h3>
        </div>
        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Current</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 flex-1">
        <div className="w-full lg:w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          {data.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between cursor-default group"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-400 text-sm font-mono">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                      opacity: activeIndex === null || activeIndex === i ? 1 : 0.25,
                    }}
                  />
                </div>
                <span className="text-white text-sm font-bold data-value w-9 text-right">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocation;
