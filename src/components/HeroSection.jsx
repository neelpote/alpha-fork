import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-semantic-profit/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Verifiable <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-green">Alpha</span>.<br />
          Private <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-semantic-profit">Strategy</span>.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Experience institutional-grade automated trading. We execute advanced strategies and provide verifiable on-chain Zero-Knowledge proofs without revealing our edge.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/workflow" className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transform hover:-translate-y-1">
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card hover:bg-card/80 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:border-white/30">
            <LayoutDashboard size={20} />
            View Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
