import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import SceneBackground from './SceneBackground';
import { useWallet } from '../context/WalletContext';

const HeroSection = () => {
  const { connected } = useWallet();

  return (
    <section className="relative w-full px-6 lg:px-10 py-28 md:py-40 flex flex-col items-center justify-center text-center overflow-hidden min-h-[90vh]">
      <SceneBackground variant="hero" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-transparent to-background/80 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 badge-green mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          ZK Proofs Live on Sepolia
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
          Verifiable{' '}
          <span className="text-gradient">Alpha</span>.<br />
          Private{' '}
          <span className="text-gradient-green">Strategy</span>.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Institutional-grade automated trading with cryptographic proof of performance.
          We prove our returns on-chain without ever revealing our edge.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {['Non-Custodial', 'ZK-Verified', 'Audited Contracts'].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
              <ShieldCheck size={12} className="text-accent-green" />
              {t}
            </span>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/workflow" className="btn-primary w-full sm:w-auto text-base px-8 py-4 rounded-full group">
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={connected ? '/dashboard' : '/connect'}
            className="btn-ghost w-full sm:w-auto text-base px-8 py-4 rounded-full"
          >
            <LayoutDashboard size={18} />
            {connected ? 'View Dashboard' : 'Connect to Access'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
