import React, { useState } from 'react';
import { Bot, TrendingUp, Zap, BarChart2, ShieldCheck, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import SceneBackground from '../components/SceneBackground';
import { Link } from 'react-router-dom';

const metrics = [
  { label: 'Annualised Return', value: '+61.2%',  color: 'text-accent-green',  sub: 'Since Jan 2025' },
  { label: 'Max Drawdown',      value: '-8.4%',   color: 'text-semantic-loss', sub: 'Controlled risk' },
  { label: 'Sharpe Ratio',      value: '2.1',     color: 'text-accent-blue',   sub: 'Risk-adjusted' },
  { label: 'Win Rate',          value: '67%',     color: 'text-accent-green',  sub: '42W / 21L' },
  { label: 'Profit Factor',     value: '2.4×',    color: 'text-accent-indigo', sub: 'Gross P/L ratio' },
  { label: 'Avg Trade',         value: '+$380',   color: 'text-accent-green',  sub: 'Per closed trade' },
];

const pillars = [
  {
    icon: TrendingUp,
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/10 border-accent-blue/20',
    title: 'Momentum Detection',
    desc: 'Identifies trending assets using multi-timeframe momentum signals across BTC, ETH, and SOL. Enters positions early in trend formation and exits before reversals.',
  },
  {
    icon: BarChart2,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10 border-accent-green/20',
    title: 'Mean Reversion',
    desc: 'Exploits short-term price dislocations from statistical equilibrium. Uses z-score bands and volume-weighted signals to time entries with high precision.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Arbitrage Engine',
    desc: 'Scans CEX/DEX price discrepancies in real-time. Executes cross-venue arbitrage with sub-millisecond latency when spread exceeds transaction cost threshold.',
  },
  {
    icon: ShieldCheck,
    color: 'text-accent-indigo',
    bg: 'bg-accent-indigo/10 border-accent-indigo/20',
    title: 'Risk Management',
    desc: 'Dynamic position sizing based on volatility regime. Hard stop-losses, max drawdown circuit breakers, and correlation-aware portfolio limits protect capital.',
  },
];

const riskRules = [
  'Max 15% allocation per single asset',
  'Hard stop-loss at 3% per trade',
  'Circuit breaker at 10% portfolio drawdown',
  'Volatility-adjusted position sizing (ATR-based)',
  'No leverage — spot only',
  'Daily PnL cap to prevent runaway losses',
];

const assets = [
  { name: 'BTC',  alloc: 42, color: '#3B82F6' },
  { name: 'ETH',  alloc: 28, color: '#6366F1' },
  { name: 'SOL',  alloc: 15, color: '#10B981' },
  { name: 'AVAX', alloc: 10, color: '#F59E0B' },
  { name: 'USDC', alloc: 5,  color: '#6B7280' },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <SceneBackground variant="light" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/65 via-background/40 to-background/65 pointer-events-none" />

      <div className="relative z-10 max-w-site mx-auto px-6 lg:px-10 py-20 space-y-16">

        {/* ── Hero ── */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="badge-blue mx-auto w-fit">Trading Strategy</div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Momentum + Mean Reversion{' '}
            <span className="text-gradient">Hybrid</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            A fully automated, AI-driven strategy that combines three alpha sources — momentum, mean reversion, and arbitrage — with institutional-grade risk controls.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link to="/connect" className="btn-primary px-8 py-3.5 rounded-xl text-base">
              <Bot size={18} /> Invest Now
            </Link>
            <Link to="/workflow" className="btn-ghost px-8 py-3.5 rounded-xl text-base">
              How It Works <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* ── Metrics strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map(({ label, value, color, sub }) => (
            <div key={label} className="glass p-5 rounded-2xl text-center glass-hover">
              <p className={`text-2xl font-bold data-value ${color} mb-1`}>{value}</p>
              <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
              <p className="text-gray-600 text-xs font-mono">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div>
          <div className="flex gap-2 border-b border-white/5 mb-10">
            {['overview', 'risk', 'allocation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-accent-blue border-accent-blue'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab === 'overview' ? 'Strategy Overview' : tab === 'risk' ? 'Risk Controls' : 'Asset Allocation'}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="glass-hover p-8 rounded-2xl space-y-4">
                  <div className={`p-3 rounded-xl border w-fit ${bg}`}>
                    <Icon size={22} className={color} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Risk */}
          {activeTab === 'risk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-2xl space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-semantic-loss/10 border border-semantic-loss/20">
                    <Lock size={18} className="text-semantic-loss" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Risk Rules</h3>
                </div>
                {riskRules.map((rule) => (
                  <div key={rule} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-accent-green shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{rule}</span>
                  </div>
                ))}
              </div>
              <div className="glass p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold text-white">Drawdown Profile</h3>
                {[
                  { label: 'Max Drawdown',    value: '-8.4%',  width: 8.4,  color: '#F43F5E' },
                  { label: 'Avg Drawdown',    value: '-3.1%',  width: 3.1,  color: '#F59E0B' },
                  { label: 'Recovery Time',   value: '4 days', width: 40,   color: '#3B82F6' },
                  { label: 'Calmar Ratio',    value: '7.3',    width: 73,   color: '#10B981' },
                ].map(({ label, value, width, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-bold data-value" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allocation */}
          {activeTab === 'allocation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-2xl space-y-5">
                <h3 className="text-xl font-bold text-white mb-2">Current Allocation</h3>
                {assets.map(({ name, alloc, color }) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300 font-mono font-bold">{name}</span>
                      <span className="font-bold data-value" style={{ color }}>{alloc}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${alloc}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass p-8 rounded-2xl space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Allocation Rules</h3>
                {[
                  'Rebalanced daily based on momentum scores',
                  'Max 42% in any single asset (BTC cap)',
                  'Min 5% USDC reserve for opportunities',
                  'Correlation-adjusted to reduce portfolio risk',
                  'Volatility-weighted across all positions',
                ].map((rule) => (
                  <div key={rule} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-accent-blue shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="glass p-10 rounded-2xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-green" />
          <h2 className="text-2xl font-bold text-white">Ready to invest with verified alpha?</h2>
          <p className="text-gray-400">Connect your wallet and start earning ZK-verified returns today.</p>
          <Link to="/connect" className="btn-primary px-10 py-4 rounded-xl text-base inline-flex mt-2">
            <Bot size={18} /> Connect Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
