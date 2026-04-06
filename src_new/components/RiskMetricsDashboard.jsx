import React from 'react';
import { Activity } from 'lucide-react';

const RiskStat = ({ label, value, sub, color }) => (
  <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200">
    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{label}</span>
    <span className={`text-2xl font-bold data-value ${color || 'text-white'}`}>{value}</span>
    {sub && <span className="text-gray-700 text-[11px] font-mono">{sub}</span>}
  </div>
);

const RiskMetricsDashboard = ({ data }) => (
  <div className="glass p-6 rounded-2xl flex flex-col h-full">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
          <Activity size={16} className="text-accent-blue" />
        </div>
        <h3 className="text-white font-bold text-base">Risk Analytics</h3>
      </div>
      <span className="badge-blue text-[10px]">ZK Verified</span>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-5">
      <RiskStat label="Win Rate"      value={`${data.winRate}%`}           sub={`${data.wins}W / ${data.losses}L`} color="text-accent-green" />
      <RiskStat label="Profit Factor" value={data.profitFactor}            sub="Gross profit / loss"               color="text-accent-blue" />
      <RiskStat label="Avg Win"       value={`+$${data.avgWin.toLocaleString()}`}  sub="per trade"                color="text-accent-green" />
      <RiskStat label="Avg Loss"      value={`-$${data.avgLoss.toLocaleString()}`} sub="per trade"                color="text-semantic-loss" />
    </div>

    <div className="mt-auto space-y-2">
      <div className="flex justify-between text-[11px] font-mono text-gray-600">
        <span>Win Rate</span>
        <span className="text-accent-green">{data.winRate}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={data.winRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Win rate ${data.winRate}%`}
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${data.winRate}%`, background: 'linear-gradient(90deg, #3B82F6, #10B981)' }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-700">
        <span>Losses ({data.losses})</span>
        <span>Wins ({data.wins})</span>
      </div>
    </div>
  </div>
);

export default RiskMetricsDashboard;
