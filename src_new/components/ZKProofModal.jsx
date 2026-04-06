import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, X, ShieldCheck } from 'lucide-react';

const ZK_STEPS = [
  { icon: '📊', text: 'Aggregating trading data...',       dur: 1000 },
  { icon: '🧠', text: 'Running ZK circuit...',             dur: 1400 },
  { icon: '🔐', text: 'Generating zk-SNARK...',            dur: 1600 },
  { icon: '📤', text: 'Submitting to smart contract...',   dur: 1000 },
  { icon: '✅', text: 'Proof verified on-chain',           dur: 0    },
];

export default function ZKProofModal({ onClose, onVerified }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current >= ZK_STEPS.length) { setDone(true); onVerified?.(); return; }
    const dur = ZK_STEPS[current]?.dur ?? 1000;
    const t = setTimeout(() => setCurrent((c) => c + 1), dur);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="zk-modal-title">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={done ? onClose : undefined} />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 border border-accent-indigo/30 shadow-[0_0_80px_rgba(99,102,241,0.25)]">
        <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-accent-indigo via-accent-blue to-accent-green" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-indigo/15 border border-accent-indigo/30">
              <ShieldCheck size={18} className="text-accent-indigo" />
            </div>
            <h3 id="zk-modal-title" className="text-lg font-bold text-white">ZK Proof Generation</h3>
          </div>
          {done && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all" aria-label="Close">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {ZK_STEPS.map((step, i) => {
            const state = i < current ? 'done' : i === current ? 'active' : 'pending';
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                state === 'done'   ? 'bg-accent-green/8 border-accent-green/20' :
                state === 'active' ? 'bg-accent-indigo/10 border-accent-indigo/30 shadow-[0_0_16px_rgba(99,102,241,0.2)]' :
                                     'bg-white/[0.02] border-white/5 opacity-35'
              }`}>
                <span className="text-lg w-6 text-center shrink-0">
                  {state === 'active' ? <Loader2 size={16} className="text-accent-indigo animate-spin" /> : step.icon}
                </span>
                <span className={`text-sm font-mono flex-1 ${
                  state === 'done' ? 'text-accent-green' : state === 'active' ? 'text-white' : 'text-gray-600'
                }`}>{step.text}</span>
                {state === 'done' && <CheckCircle size={14} className="text-accent-green shrink-0" />}
              </div>
            );
          })}
        </div>

        {done ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-green/10 border border-accent-green/25">
              <CheckCircle size={20} className="text-accent-green shrink-0" />
              <div>
                <p className="text-accent-green font-bold text-sm">Proof Verified On-Chain</p>
                <p className="text-gray-500 text-xs font-mono mt-0.5">Last Verified: Just now · Sepolia Testnet</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl">
              <ShieldCheck size={16} /> View Updated Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-indigo to-accent-green rounded-full transition-all duration-700"
                style={{ width: `${(current / ZK_STEPS.length) * 100}%` }} />
            </div>
            <p className="text-center text-gray-600 text-xs font-mono">Generating cryptographic proof...</p>
          </div>
        )}
      </div>
    </div>
  );
}
