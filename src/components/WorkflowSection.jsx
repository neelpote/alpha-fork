import React, { useEffect, useRef, useState } from 'react';
import { Bot, Fingerprint, ShieldCheck, ArrowDown, ArrowRight, Zap, Lock, CheckCircle, TrendingUp } from 'lucide-react';

const GradientBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none"
    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
);

// ── Step data ─────────────────────────────────────────────────────────────────
const steps = [
  {
    number: '01',
    icon: Bot,
    iconColor: 'text-accent-blue',
    iconBg: 'bg-accent-blue/10 border-accent-blue/20',
    glowColor: 'rgba(59,130,246,0.15)',
    accentColor: '#3B82F6',
    tag: 'Off-Chain',
    tagColor: 'badge-blue',
    title: 'Trading Bot Executes Strategy',
    description:
      'Our proprietary AI engine monitors global markets 24/7, identifying arbitrage opportunities and executing high-speed trades across CEXs and DEXs. All logic stays private — only results are exposed.',
    bullets: [
      { icon: Zap,       text: 'Sub-millisecond execution' },
      { icon: TrendingUp, text: 'Momentum + mean reversion hybrid' },
      { icon: Lock,      text: 'Strategy logic never leaves our servers' },
    ],
    output: 'Raw PnL data',
  },
  {
    number: '02',
    icon: Fingerprint,
    iconColor: 'text-accent-green',
    iconBg: 'bg-accent-green/10 border-accent-green/20',
    glowColor: 'rgba(16,185,129,0.15)',
    accentColor: '#10B981',
    tag: 'ZK Layer',
    tagColor: 'badge-green',
    title: 'System Generates Zero-Knowledge Proof',
    description:
      'Our off-chain prover generates a zk-SNARK that cryptographically guarantees the reported PnL is accurate and derived from valid trades — without revealing a single trade detail.',
    bullets: [
      { icon: ShieldCheck, text: 'zk-SNARK proof generation' },
      { icon: Lock,        text: 'Strategy remains 100% private' },
      { icon: CheckCircle, text: 'Mathematically unforgeable' },
    ],
    output: 'ZK Proof bundle',
  },
  {
    number: '03',
    icon: ShieldCheck,
    iconColor: 'text-accent-indigo',
    iconBg: 'bg-accent-indigo/10 border-accent-indigo/20',
    glowColor: 'rgba(99,102,241,0.15)',
    accentColor: '#6366F1',
    tag: 'On-Chain',
    tagColor: 'badge-blue',
    title: 'Smart Contract Verifies Proof',
    description:
      'The proof is submitted on-chain. Our audited smart contract verifies it instantly. Once verified, the APY is published publicly and investors can deposit with full cryptographic confidence.',
    bullets: [
      { icon: CheckCircle, text: 'Instant on-chain verification' },
      { icon: TrendingUp,  text: 'APY published trustlessly' },
      { icon: ShieldCheck, text: 'Non-custodial investor funds' },
    ],
    output: 'Verified APY on-chain',
  },
];

// ── Animated step card ────────────────────────────────────────────────────────
function StepCard({ step, index, isVisible }) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Number + icon column */}
      <div className={`w-full lg:w-40 shrink-0 flex flex-col items-center gap-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
        {/* Big step number */}
        <div className="relative">
          <span
            className="text-[80px] font-black leading-none select-none"
            style={{ color: step.accentColor, opacity: 0.12 }}
          >
            {step.number}
          </span>
          {/* Icon centered over number */}
          <div
            className={`absolute inset-0 flex items-center justify-center`}
          >
            <div
              className={`p-4 rounded-2xl border ${step.iconBg} shadow-lg`}
              style={{ boxShadow: `0 0 30px ${step.glowColor}` }}
            >
              <Icon size={32} className={step.iconColor} />
            </div>
          </div>
        </div>

        {/* Output badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono"
          style={{
            background: `${step.accentColor}10`,
            borderColor: `${step.accentColor}30`,
            color: step.accentColor,
          }}
        >
          <ArrowDown size={10} />
          {step.output}
        </div>
      </div>

      {/* Content column */}
      <div className={`flex-1 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
        <div
          className="glass rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          style={{ boxShadow: `0 0 40px ${step.glowColor}` }}
        >
          {/* Accent top bar */}
          <div
            className="absolute top-0 left-0 w-full h-0.5"
            style={{ background: `linear-gradient(90deg, ${step.accentColor}, transparent)` }}
          />

          {/* Tag */}
          <div className={`${step.tagColor} w-fit mb-4`}>{step.tag}</div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
            {step.title}
          </h3>
          <p className="text-gray-400 leading-relaxed mb-6">{step.description}</p>

          {/* Bullets */}
          <div className="space-y-2.5">
            {step.bullets.map(({ icon: BIcon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="p-1 rounded-md shrink-0"
                  style={{ background: `${step.accentColor}15` }}
                >
                  <BIcon size={13} style={{ color: step.accentColor }} />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Connector between steps ───────────────────────────────────────────────────
function Connector({ fromColor, toColor, isVisible, delay }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 py-2 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-px h-8 bg-gradient-to-b from-white/20 to-white/5" />
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border"
        style={{
          background: `linear-gradient(135deg, ${fromColor}15, ${toColor}15)`,
          borderColor: `${toColor}25`,
          color: toColor,
        }}
      >
        <ArrowDown size={10} />
        passed to next layer
      </div>
      <div className="w-px h-8 bg-gradient-to-b from-white/5 to-white/20" />
    </div>
  );
}

// ── Flow diagram (mini visual) ────────────────────────────────────────────────
function FlowDiagram() {
  const nodes = [
    { label: 'Trading Bot',    color: '#3B82F6', sub: 'Off-chain', icon: '🤖' },
    { label: 'ZK Prover',      color: '#10B981', sub: 'Private',   icon: '🔐' },
    { label: 'Smart Contract', color: '#6366F1', sub: 'On-chain',  icon: '📜' },
    { label: 'Investor',       color: '#F59E0B', sub: 'Verified',  icon: '💰' },
  ];

  return (
    <div className="glass rounded-2xl p-10 mt-16">
      <p className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest mb-10">
        End-to-end flow
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {nodes.map((node, i) => (
          <React.Fragment key={node.label}>
            <div className="flex flex-col items-center gap-3">
              {/* Node box */}
              <div
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all duration-300 hover:scale-105"
                style={{
                  background: `${node.color}12`,
                  borderColor: `${node.color}40`,
                  boxShadow: `0 0 24px ${node.color}20`,
                }}
              >
                <span className="text-3xl">{node.icon}</span>
                <span
                  className="text-sm font-bold text-center leading-tight px-2"
                  style={{ color: node.color }}
                >
                  {node.label}
                </span>
              </div>
              {/* Sub label */}
              <span
                className="text-xs font-mono font-semibold px-3 py-1 rounded-full border"
                style={{
                  color: node.color,
                  background: `${node.color}10`,
                  borderColor: `${node.color}30`,
                }}
              >
                {node.sub}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex flex-col items-center gap-1 mb-8">
                <ArrowRight size={28} className="text-white/25" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function WorkflowSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative w-full py-28 px-6 lg:px-10 section-divider overflow-hidden">
      <GradientBg />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-transparent to-background/60 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div
          className={`text-center mb-20 space-y-4 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="badge-blue mx-auto w-fit mb-4">Application Flow</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            How <span className="text-gradient">AlphaVault</span> Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A three-layer architecture that proves trading performance without ever
            revealing the strategy — powered by Zero-Knowledge cryptography.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <StepCard step={step} index={idx} isVisible={visible} />
              {idx < steps.length - 1 && (
                <Connector
                  fromColor={steps[idx].accentColor}
                  toColor={steps[idx + 1].accentColor}
                  isVisible={visible}
                  delay={idx * 150 + 300}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Flow diagram */}
        <div
          className={`transition-all duration-700 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <FlowDiagram />
        </div>

      </div>
    </section>
  );
}
