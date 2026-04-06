import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, X } from 'lucide-react';

const DEPOSIT_STEPS = [
  { icon: '⏳', text: 'Submitting transaction...' },
  { icon: '🔐', text: 'Generating proof context...' },
  { icon: '📤', text: 'Broadcasting to network...' },
  { icon: '✅', text: 'Transaction confirmed' },
  { icon: '🧠', text: 'ZK proof will be generated in next epoch' },
];

const WITHDRAW_STEPS = [
  { icon: '⚡', text: 'Withdraw request initiated' },
  { icon: '🔍', text: 'Awaiting proof verification...' },
  { icon: '✅', text: 'Funds available after verification' },
];

export default function TransactionModal({ type, onClose }) {
  const steps = type === 'deposit' ? DEPOSIT_STEPS : WITHDRAW_STEPS;
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current >= steps.length) { setDone(true); return; }
    const t = setTimeout(() => setCurrent((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [current, steps.length]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && done) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [done, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tx-modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={done ? onClose : undefined} />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.2)]">
        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-green" />

        <div className="flex items-center justify-between mb-6">
          <h3 id="tx-modal-title" className="text-lg font-bold text-white">
            {type === 'deposit' ? '💰 Deposit' : '📤 Withdraw'}
          </h3>
          {done && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all" aria-label="Close">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((step, i) => {
            const state = i < current ? 'done' : i === current ? 'active' : 'pending';
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                state === 'done'   ? 'bg-accent-green/8 border-accent-green/20' :
                state === 'active' ? 'bg-accent-blue/10 border-accent-blue/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]' :
                                     'bg-white/[0.02] border-white/5 opacity-40'
              }`}>
                <span className="text-lg w-6 text-center shrink-0">
                  {state === 'active' ? <Loader2 size={16} className="text-accent-blue animate-spin" /> : step.icon}
                </span>
                <span className={`text-sm font-mono ${
                  state === 'done' ? 'text-accent-green' : state === 'active' ? 'text-white' : 'text-gray-600'
                }`}>{step.text}</span>
                {state === 'done' && <CheckCircle size={14} className="text-accent-green ml-auto shrink-0" />}
              </div>
            );
          })}
        </div>

        {done ? (
          <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl">
            <CheckCircle size={16} /> Done
          </button>
        ) : (
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-700"
              style={{ width: `${(current / steps.length) * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
