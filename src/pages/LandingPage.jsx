import React from 'react';
import HeroSection from '../components/HeroSection';
import WorkflowCards from '../components/WorkflowCards';
import WorkflowSection from '../components/WorkflowSection';
import PastPerformanceSection from '../components/PastPerformanceSection';
import DemoSection from '../components/DemoSection';
import { ShieldCheck, EyeOff, LockKeyhole } from 'lucide-react';

// Static gradient blob — replaces Three.js canvas for non-hero sections
const GradientBg = () => (
  <>
    <div className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
    <div className="absolute bottom-0 left-1/4 w-96 h-64 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
  </>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: <EyeOff size={32} className="text-gray-400" />,
      title: 'Strategy Stays Private',
      description: 'Individual trade entry/exit prices, position sizes, and strategy logic never touch the blockchain. Only the cryptographic proof does.',
    },
    {
      icon: <ShieldCheck size={32} className="text-accent-blue" />,
      title: 'APY is Mathematically Verified',
      description: 'The Midnight smart contract runs the formula APY = (netPnL / capital) × (365 / period) × 10000 inside a ZK circuit. If the numbers are wrong, the proof fails and the transaction reverts.',
    },
    {
      icon: <LockKeyhole size={32} className="text-semantic-profit" />,
      title: 'Why Midnight, Not Ethereum?',
      description: 'Ethereum makes all inputs public. Midnight\'s ZK-native architecture lets the circuit verify private witnesses — trade data stays off-chain while the proof goes on-chain.',
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-10 border-t border-white/5 overflow-hidden">
      <GradientBg />
      <div className="relative z-10 max-w-site mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Why This Needs Midnight</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Any chain can store an APY number. Only Midnight can <span className="text-white font-semibold">prove it's correct</span> without revealing the data behind it.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-4 group">
              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg group-hover:border-white/20 group-hover:-translate-y-1 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed max-w-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Private vs Public split */}
        <div className="mt-20 glass rounded-2xl p-8 border border-white/5">
          <h3 className="text-white font-bold text-xl text-center mb-8">What Goes On-Chain vs What Stays Private</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-red-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <EyeOff size={12} /> Private — inside ZK proof only
              </p>
              {[
                'Individual trade entry & exit prices',
                'Position sizes per trade',
                'Net PnL raw value',
                'Initial capital amount',
                'Trading strategy logic',
                'Trading period length',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-semantic-profit font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={12} /> Public — written to Midnight ledger
              </p>
              {[
                'Verified APY in basis points',
                'Total trades count',
                'Total Value Locked',
                'Admin (quant) address',
                'Trade data commitment hash',
                'Transaction history',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-semantic-profit/60 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => (
  <div className="flex flex-col flex-1 w-full overflow-x-hidden">
    <HeroSection />       {/* ← only section with Three.js canvas */}
    <WorkflowCards />
    <WorkflowSection />
    <PastPerformanceSection />
    <DemoSection />
    <FeaturesSection />
  </div>
);

export default LandingPage;
