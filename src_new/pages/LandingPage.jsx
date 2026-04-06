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
      title: 'Absolute Privacy',
      description: 'Our trading algorithms remain strictly confidential. You only see the cryptographically secured results.',
    },
    {
      icon: <ShieldCheck size={32} className="text-accent-blue" />,
      title: '100% Verifiable',
      description: 'Every claimed return is backed by a Zero-Knowledge Proof verifying the PnL on-chain without trusting our servers.',
    },
    {
      icon: <LockKeyhole size={32} className="text-semantic-profit" />,
      title: 'Trustless Execution',
      description: 'Interact solely through our audited smart contracts. AlphaVault can never touch your deposited principle.',
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-10 border-t border-white/5 overflow-hidden">
      <GradientBg />
      <div className="relative z-10 max-w-site mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Institutional Features</h2>
          <p className="text-gray-400 text-lg">Designed for investors who demand both performance and security.</p>
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
