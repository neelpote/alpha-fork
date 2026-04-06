import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';

function useCountdown(targetMinutes) {
  const [secs, setSecs] = useState(targetMinutes * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function EpochStatus({ lastVerified = 'Just now' }) {
  const nextIn = useCountdown(240); // 4 hours

  return (
    <div className="glass rounded-2xl px-6 py-4 border border-white/5 flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
          <Zap size={13} className="text-accent-blue" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Current Epoch</p>
          <p className="text-white font-bold text-sm data-value">Week 12</p>
        </div>
      </div>

      <div className="w-px h-8 bg-white/5 hidden sm:block" />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-accent-green/10 border border-accent-green/20">
          <ShieldCheck size={13} className="text-accent-green" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Last Proof</p>
          <p className="text-accent-green font-bold text-sm font-mono">{lastVerified}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-white/5 hidden sm:block" />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Clock size={13} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Next Proof</p>
          <p className="text-yellow-400 font-bold text-sm font-mono">In {nextIn}</p>
        </div>
      </div>

      <div className="ml-auto hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
        <span className="text-accent-green text-[11px] font-mono">ZK Proof Verified On-Chain</span>
      </div>
    </div>
  );
}
