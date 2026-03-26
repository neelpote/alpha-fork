import React from 'react';
import { Bot, Fingerprint, Lock } from 'lucide-react';

const WorkflowCards = () => {
  const cards = [
    {
      icon: <Bot size={40} className="text-accent-blue" />,
      title: "1. Bot Trading",
      desc: "Our proprietary AI analyzes market sentiment and executes low-latency trades across CEXs and DEXs.",
    },
    {
      icon: <Fingerprint size={40} className="text-accent-green" />,
      title: "2. Generate ZK Proof",
      desc: "We generate a Zero-Knowledge Proof (ZK-SNARK) validating our PnL off-chain without exposing the strategy logic.",
    },
    {
      icon: <Lock size={40} className="text-purple-500" />,
      title: "3. Verify On-Chain",
      desc: "A smart contract verifies the submitted proof. Investors can trust the returns cryptographically.",
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-white tracking-wide">How AlphaVault Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="glass p-8 rounded-2xl flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] group">
              <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowCards;
