import React from 'react';
import { Bot, Fingerprint, Lock, ArrowDown } from 'lucide-react';

const GradientBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none"
    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
);

const steps = [
  {
    icon: <Bot size={48} className="text-accent-blue" />,
    title: 'Step 1: Trading Bot Executes Strategy',
    desc: 'AlphaVault proprietary AI trading engine monitors global markets 24/7. It identifies arbitrage opportunities and executes high-speed trades across multiple decentralized and centralized exchanges, accumulating profit.',
  },
  {
    icon: <Fingerprint size={48} className="text-accent-green" />,
    title: 'Step 2: System Generates Zero-Knowledge Proof',
    desc: 'To prove our performance without revealing the trading logic, our off-chain prover generates a zk-SNARK. This cryptographically guarantees that the reported PnL is accurate and derived from valid trades, preserving complete strategy privacy.',
  },
  {
    icon: <Lock size={48} className="text-purple-500" />,
    title: 'Step 3: Smart Contract Verifies Proof',
    desc: 'The generated proof is submitted on-chain. Our smart contract verifies the proof validity instantly. Once verified, the accumulated profits are securely available for investors to claim in a completely trustless manner.',
  },
];

const AboutPage = () => (
  <div className="relative flex-1 w-full px-6 lg:px-10 py-20 flex flex-col items-center overflow-hidden">
    <GradientBg />
    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/35 to-background/70 pointer-events-none" />

    <div className="relative z-10 max-w-4xl w-full">
      <div className="text-center mb-20 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          How AlphaVault Works
        </h1>
        <p className="text-xl text-gray-400">
          Verifiable architecture ensuring both complete privacy and total transparency.
        </p>
      </div>

      <div className="space-y-12">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="glass p-8 md:p-10 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex-shrink-0 p-6 rounded-2xl bg-card border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                {step.icon}
              </div>
              <div className="flex flex-col text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{step.desc}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex justify-center my-6 text-white/50 animate-pulse">
                <ArrowDown size={40} className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export default AboutPage;
