import React from 'react';
import { Bot, Fingerprint, Lock, ArrowDown, ShieldCheck, EyeOff, Database, CheckCircle } from 'lucide-react';

const GradientBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none"
    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
);

const steps = [
  {
    icon: <Bot size={48} className="text-accent-blue" />,
    title: 'Step 1: Trading Bot Executes Strategy',
    desc: 'The AlphaVault AI bot fetches real BTC/ETH/SOL prices and executes a momentum + mean reversion strategy. Every trade — entry price, exit price, position size — is recorded locally. This data never leaves the quant\'s machine.',
    detail: 'Private data: entry prices, exit prices, sizes, PnL per trade',
    detailColor: 'text-red-400',
  },
  {
    icon: <Fingerprint size={48} className="text-accent-green" />,
    title: 'Step 2: ZK Proof is Generated Locally',
    desc: 'The off-chain prover aggregates the trades into: net PnL, initial capital, and trading period. It then computes APY = (netPnL / capital) × (365 / period) × 10000. A SHA-256 hash of the full trade dataset is also computed as a commitment.',
    detail: 'The proof server (Docker) generates a zk-SNARK that binds these private values to the public APY claim.',
    detailColor: 'text-yellow-400',
  },
  {
    icon: <Lock size={48} className="text-purple-500" />,
    title: 'Step 3: Midnight Contract Verifies the Math',
    desc: 'The updatePerformance circuit on Midnight receives the APY and trade count as public inputs, and the private aggregates as witnesses. It verifies the APY formula holds without ever seeing the raw trades. If the quant inflated the APY, the math fails and the transaction reverts.',
    detail: 'Public on-chain: verified APY, trade count, trade data commitment hash',
    detailColor: 'text-semantic-profit',
  },
  {
    icon: <Database size={48} className="text-accent-indigo" />,
    title: 'Step 4: Investors Can Audit Anytime',
    desc: 'The trade data commitment hash is stored on the Midnight ledger. If the quant ever chooses to disclose the raw trade CSV, any investor can SHA-256 hash it and verify it matches the on-chain commitment. This is selective disclosure — privacy by default, auditable on demand.',
    detail: 'Contract address: 52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e',
    detailColor: 'text-gray-500',
  },
];

const whyMidnight = [
  {
    title: 'Ethereum would expose everything',
    desc: 'On Ethereum, all transaction inputs are public. Submitting trade data on-chain would reveal the entire strategy to competitors.',
  },
  {
    title: 'Midnight has ZK-native circuits',
    desc: 'Compact (Midnight\'s language) lets you declare private witnesses that are proven inside the ZK circuit but never written to the ledger.',
  },
  {
    title: 'The proof IS the verification',
    desc: 'Midnight validators don\'t re-execute the circuit logic — they verify the proof. This means the strategy logic is never exposed, even to validators.',
  },
];

const AboutPage = () => (
  <div className="relative flex-1 w-full px-6 lg:px-10 py-20 flex flex-col items-center overflow-hidden">
    <GradientBg />
    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/35 to-background/70 pointer-events-none" />

    <div className="relative z-10 max-w-4xl w-full space-y-20">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">How AlphaVault Works</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          A step-by-step breakdown of how Midnight's ZK circuits verify trading performance without revealing a single trade.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-12">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="glass p-8 md:p-10 rounded-3xl flex flex-col md:flex-row items-start gap-8 hover:scale-[1.01] transition-transform duration-300">
              <div className="flex-shrink-0 p-6 rounded-2xl bg-card border border-white/10">
                {step.icon}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{step.desc}</p>
                <p className={`text-sm font-mono ${step.detailColor}`}>{step.detail}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex justify-center text-white/30 animate-pulse">
                <ArrowDown size={36} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Why Midnight */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Why Midnight Specifically?</h2>
          <p className="text-gray-400">This couldn't be built on any other chain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whyMidnight.map((item, i) => (
            <div key={i} className="glass p-6 rounded-2xl space-y-3 border border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-accent-blue shrink-0" />
                <p className="text-white font-semibold text-sm">{item.title}</p>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Circuit explanation */}
      <div className="glass p-8 rounded-2xl border border-accent-blue/20 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-accent-blue" />
          <h3 className="text-white font-bold text-lg">What the ZK Circuit Actually Verifies</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          The <code className="text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">updatePerformance</code> circuit on Midnight takes:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="space-y-2">
            <p className="text-red-400 text-xs uppercase tracking-widest">Private witnesses (never on-chain)</p>
            {['privateNetPnl — total profit × 1000', 'privateCapital — starting capital × 1000', 'privateTradePeriod — days of trading', 'privateTradeCount — number of trades', 'privateTradeHash — SHA-256 of trade CSV'].map(w => (
              <p key={w} className="text-gray-400 text-xs">• {w}</p>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-semantic-profit text-xs uppercase tracking-widest">Public inputs & outputs</p>
            {['newApy — submitted APY in basis points', 'numTrades — trade count (public)', '→ verifiedApy written to ledger', '→ tradeDataCommitment written to ledger', '→ totalTrades updated on ledger'].map(w => (
              <p key={w} className="text-gray-400 text-xs">• {w}</p>
            ))}
          </div>
        </div>
        <p className="text-gray-500 text-xs">
          The circuit asserts: <code className="text-yellow-400">|newApy × (capital × period) - netPnL × 365 × 10000| ≤ (capital × period)</code>
          <br />If this fails, the proof is rejected and the APY is never written on-chain.
        </p>
      </div>

    </div>
  </div>
);

export default AboutPage;
