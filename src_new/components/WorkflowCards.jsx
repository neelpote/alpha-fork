import React from 'react';
import { Bot, Fingerprint, Lock } from 'lucide-react';

const GradientBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none"
    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
);

const cards = [
  {
    icon: Bot,
    iconColor: 'text-accent-blue',
    iconBg: 'bg-accent-blue/10 border-accent-blue/20',
    title: '1. Bot Trading',
    desc: 'Our proprietary AI analyzes market sentiment and executes low-latency trades across CEXs and DEXs.',
  },
  {
    icon: Fingerprint,
    iconColor: 'text-accent-green',
    iconBg: 'bg-accent-green/10 border-accent-green/20',
    title: '2. Generate ZK Proof',
    desc: 'We generate a Zero-Knowledge Proof (ZK-SNARK) validating our PnL off-chain without exposing the strategy logic.',
  },
  {
    icon: Lock,
    iconColor: 'text-accent-indigo',
    iconBg: 'bg-accent-indigo/10 border-accent-indigo/20',
    title: '3. Verify On-Chain',
    desc: 'A smart contract verifies the submitted proof. Investors can trust the returns cryptographically.',
  },
];

const WorkflowCards = () => (
    <section className="relative py-24 px-6 lg:px-10 section-divider overflow-hidden">
      <GradientBg />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-transparent to-background/60 pointer-events-none" />

    <div className="relative z-10 max-w-site mx-auto">
      <div className="text-center mb-16 space-y-3">
        <div className="badge-blue mx-auto w-fit mb-4">How It Works</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Three Steps to <span className="text-gradient">Trustless Alpha</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-hover p-8 rounded-2xl flex flex-col items-start gap-5">
              <div className={`p-3 rounded-xl border ${card.iconBg}`}>
                <Icon size={24} className={card.iconColor} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default WorkflowCards;
