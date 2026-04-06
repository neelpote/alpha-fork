import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShieldCheck, Zap, Activity, ArrowUpRight, Lock, Bot, Cpu, Layers, Atom } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

// ── Three.js ──────────────────────────────────────────────────────────────────
function FloatingOrb({ position, color, speed = 1, distort = 0.4, scale = 1 }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * speed * 0.3) * 0.3;
    mesh.current.rotation.y = clock.elapsedTime * speed * 0.2;
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.5}>
      <Sphere ref={mesh} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial color={color} attach="material" distort={distort} speed={2}
          roughness={0.1} metalness={0.8} transparent opacity={0.5} />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const pts = useRef();
  const positions = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3]     = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, []);
  useFrame(({ clock }) => {
    if (!pts.current) return;
    pts.current.rotation.y = clock.elapsedTime * 0.03;
    pts.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.1;
  });
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#3B82F6" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function GridPlane() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.position.z = ((clock.elapsedTime * 0.4) % 1) - 0.5;
  });
  return <gridHelper ref={mesh} args={[40, 40, '#0D2040', '#0D1A2E']} position={[0, -3, 0]} />;
}

function ThreeScene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]}   intensity={1}   color="#3B82F6" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#6366F1" />
      <Stars radius={60} depth={30} count={700} factor={3} saturation={0} fade speed={0.4} />
      <Particles />
      <GridPlane />
      <FloatingOrb position={[-4, 2, -3]}  color="#3B82F6" speed={0.8} distort={0.5} scale={1.8} />
      <FloatingOrb position={[5, -1, -4]}  color="#6366F1" speed={1.2} distort={0.3} scale={1.3} />
      <FloatingOrb position={[0, 3, -5]}   color="#10B981" speed={0.6} distort={0.6} scale={1.1} />
      <FloatingOrb position={[-6, -2, -6]} color="#3B82F6" speed={1.0} distort={0.4} scale={0.9} />
    </>
  );
}

// ── Bot definitions ───────────────────────────────────────────────────────────
const BOTS = [
  {
    id: 'alpha', icon: Bot, name: 'AlphaVault AI', subtitle: 'Momentum + Mean Reversion',
    status: 'Live', color: '#3B82F6', statusCls: 'bg-accent-green/15 border-accent-green/30 text-accent-green',
    risk: 'Medium', strategyType: 'Momentum', minDeposit: '$500',
    metrics: [
      { label: 'APY', value: '+24.5%', color: 'text-accent-green', up: true },
      { label: 'TVL', value: '$125K',  color: 'text-white' },
      { label: 'DD',  value: '-8.4%',  color: 'text-semantic-loss', up: false },
      { label: 'Sharpe', value: '2.1', color: 'text-accent-blue' },
    ],
    equity: [{ v:100 },{ v:104 },{ v:111 },{ v:108 },{ v:118 },{ v:125 },{ v:132 }],
    pct: '+32.0%',
    trades: [
      { asset:'BTC', action:'BUY',  pnl:'-$120', profit:false },
      { asset:'ETH', action:'SELL', pnl:'+$450', profit:true  },
      { asset:'SOL', action:'BUY',  pnl:'+$120', profit:true  },
    ],
    alloc: [
      { name:'BTC', pct:42, color:'#3B82F6' },{ name:'ETH', pct:28, color:'#6366F1' },
      { name:'SOL', pct:15, color:'#10B981' },{ name:'Other', pct:15, color:'#F59E0B' },
    ],
  },
  {
    id: 'nexus', icon: Cpu, name: 'Nexus Scalper', subtitle: 'High-Frequency Arbitrage',
    status: 'Live', color: '#10B981', statusCls: 'bg-accent-green/15 border-accent-green/30 text-accent-green',
    risk: 'Low', strategyType: 'Arbitrage', minDeposit: '$1,000',
    metrics: [
      { label: 'APY', value: '+38.2%', color: 'text-accent-green', up: true },
      { label: 'TVL', value: '$89K',   color: 'text-white' },
      { label: 'DD',  value: '-5.1%',  color: 'text-semantic-loss', up: false },
      { label: 'Sharpe', value: '3.4', color: 'text-accent-blue' },
    ],
    equity: [{ v:100 },{ v:108 },{ v:115 },{ v:122 },{ v:119 },{ v:131 },{ v:138 }],
    pct: '+38.2%',
    trades: [
      { asset:'ETH', action:'BUY',  pnl:'+$680', profit:true  },
      { asset:'BTC', action:'SELL', pnl:'+$290', profit:true  },
      { asset:'SOL', action:'SELL', pnl:'-$85',  profit:false },
    ],
    alloc: [
      { name:'ETH', pct:50, color:'#10B981' },{ name:'BTC', pct:30, color:'#3B82F6' },
      { name:'SOL', pct:12, color:'#8B5CF6' },{ name:'USDC', pct:8, color:'#6B7280' },
    ],
  },
  {
    id: 'prism', icon: Layers, name: 'Prism Delta', subtitle: 'Options + Derivatives',
    status: 'Beta', color: '#8B5CF6', statusCls: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
    risk: 'High', strategyType: 'Derivatives', minDeposit: '$2,500',
    metrics: [
      { label: 'APY', value: '+19.7%', color: 'text-accent-green', up: true },
      { label: 'TVL', value: '$42K',   color: 'text-white' },
      { label: 'DD',  value: '-12.3%', color: 'text-semantic-loss', up: false },
      { label: 'Sharpe', value: '1.8', color: 'text-accent-blue' },
    ],
    equity: [{ v:100 },{ v:102 },{ v:98 },{ v:107 },{ v:112 },{ v:108 },{ v:120 }],
    pct: '+19.7%',
    trades: [
      { asset:'ETH', action:'BUY',  pnl:'+$340', profit:true  },
      { asset:'BTC', action:'BUY',  pnl:'-$210', profit:false },
      { asset:'SOL', action:'SELL', pnl:'+$175', profit:true  },
    ],
    alloc: [
      { name:'ETH', pct:45, color:'#8B5CF6' },{ name:'BTC', pct:35, color:'#3B82F6' },
      { name:'AVAX', pct:12, color:'#F59E0B' },{ name:'USDC', pct:8, color:'#6B7280' },
    ],
  },
  {
    id: 'quasar', icon: Atom, name: 'Quasar Grid', subtitle: 'Grid Trading + DCA',
    status: 'New', color: '#F59E0B', statusCls: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    risk: 'Low', strategyType: 'Grid / DCA', minDeposit: '$250',
    metrics: [
      { label: 'APY', value: '+14.3%', color: 'text-accent-green', up: true },
      { label: 'TVL', value: '$28K',   color: 'text-white' },
      { label: 'DD',  value: '-4.2%',  color: 'text-semantic-loss', up: false },
      { label: 'Sharpe', value: '2.6', color: 'text-accent-blue' },
    ],
    equity: [{ v:100 },{ v:101 },{ v:103 },{ v:105 },{ v:108 },{ v:111 },{ v:114 }],
    pct: '+14.3%',
    trades: [
      { asset:'BTC', action:'BUY',  pnl:'+$95',  profit:true  },
      { asset:'BTC', action:'BUY',  pnl:'+$110', profit:true  },
      { asset:'ETH', action:'SELL', pnl:'-$45',  profit:false },
    ],
    alloc: [
      { name:'BTC', pct:60, color:'#F59E0B' },{ name:'ETH', pct:25, color:'#3B82F6' },
      { name:'USDC', pct:15, color:'#6B7280' },
    ],
  },
];

// ── Mini metric ───────────────────────────────────────────────────────────────
function MiniMetric({ label, value, color = 'text-white', up }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-bold data-value ${color}`}>{value}</span>
        {up !== undefined && (
          <ArrowUpRight size={11} className={up ? 'text-accent-green' : 'text-semantic-loss rotate-180'} />
        )}
      </div>
    </div>
  );
}

// ── Bot selector cards ────────────────────────────────────────────────────────
function BotSelector({ bots, activeId, onSelect }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {bots.map((bot) => {
        const Icon = bot.icon;
        const active = bot.id === activeId;
        return (
          <button
            key={bot.id}
            onClick={() => onSelect(bot.id)}
            className={`relative p-4 rounded-2xl border text-left transition-all duration-300 group ${
              active
                ? 'border-white/20 shadow-lg scale-[1.02]'
                : 'border-white/5 hover:border-white/15 hover:scale-[1.01]'
            }`}
            style={{
              background: active
                ? `linear-gradient(135deg, ${bot.color}18, rgba(10,10,11,0.95))`
                : 'rgba(255,255,255,0.03)',
              boxShadow: active ? `0 0 30px ${bot.color}25` : undefined,
            }}
          >
            {/* Active indicator */}
            {active && (
              <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${bot.color}, transparent)` }} />
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl border"
                style={{ background: `${bot.color}15`, borderColor: `${bot.color}30` }}>
                <Icon size={16} style={{ color: bot.color }} />
              </div>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${bot.statusCls}`}>
                {bot.status}
              </span>
            </div>

            <p className="text-white font-bold text-sm leading-tight">{bot.name}</p>
            <p className="text-gray-600 text-[10px] font-mono mt-0.5 leading-tight">{bot.subtitle}</p>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600">APY</span>
                <span className="text-accent-green text-sm font-bold data-value">{bot.metrics[0].value}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600">Risk</span>
                <span className={`text-[10px] font-mono font-bold ${
                  bot.risk === 'Low' ? 'text-accent-green' : bot.risk === 'Medium' ? 'text-yellow-400' : 'text-semantic-loss'
                }`}>{bot.risk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600">Min</span>
                <span className="text-[10px] font-mono text-gray-400">{bot.minDeposit}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Mock dashboard for active bot ─────────────────────────────────────────────
function BotDashboard({ bot }) {
  const gradId = `grad-${bot.id}`;
  return (
    <div className="relative w-full max-w-3xl mx-auto select-none pointer-events-none">
      <div className="absolute inset-0 rounded-2xl blur-2xl scale-105"
        style={{ background: `radial-gradient(ellipse, ${bot.color}20, transparent 70%)` }} />

      <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl"
        style={{ background: 'rgba(10,10,11,0.94)', backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px ${bot.color}18` }}>

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-semantic-loss/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green/60" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-gray-600 text-xs font-mono">alphavault.io/dashboard</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
            style={{ background: `${bot.color}15`, borderColor: `${bot.color}30` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: bot.color }} />
            <span className="text-[10px] font-mono" style={{ color: bot.color }}>ZK Verified</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-sm">{bot.name}</h3>
              <p className="text-gray-600 text-[11px] font-mono">{bot.subtitle} · Ethereum Mainnet</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-lg text-white text-xs font-semibold"
                style={{ background: `linear-gradient(135deg, ${bot.color}, #6366F1)` }}>Deposit</div>
              <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/8 text-white text-xs">Withdraw</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-2">
            {bot.metrics.map((m) => (
              <div key={m.label} className="rounded-xl p-3 border border-white/5"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <MiniMetric {...m} />
              </div>
            ))}
          </div>

          {/* Equity chart */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-white text-xs font-semibold">Portfolio Equity</span>
              <span className="text-xs font-mono font-bold data-value" style={{ color: bot.color }}>{bot.pct}</span>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bot.equity} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={bot.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={bot.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={bot.color} strokeWidth={2}
                    fill={`url(#${gradId})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trades + Allocation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 space-y-2 border border-white/5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-white text-[11px] font-semibold">Recent Trades</span>
              {bot.trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-[11px] font-mono font-bold">{t.asset}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      t.action === 'BUY' ? 'bg-accent-blue/15 text-accent-blue' : 'bg-accent-indigo/15 text-accent-indigo'
                    }`}>{t.action}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold data-value ${t.profit ? 'text-accent-green' : 'text-semantic-loss'}`}>
                    {t.pnl}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3 space-y-2 border border-white/5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-white text-[11px] font-semibold">Allocation</span>
              {bot.alloc.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <span className="text-gray-500 text-[10px] w-8 font-mono">{a.name}</span>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                  </div>
                  <span className="text-gray-400 text-[10px] font-mono w-7 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature pills ─────────────────────────────────────────────────────────────
const pills = [
  { icon: ShieldCheck, label: 'ZK-Verified Returns', color: 'text-accent-blue',   bg: 'bg-accent-blue/10 border-accent-blue/20'   },
  { icon: Lock,        label: 'Non-Custodial',        color: 'text-accent-indigo', bg: 'bg-accent-indigo/10 border-accent-indigo/20' },
  { icon: Zap,         label: 'AI-Powered Strategy',  color: 'text-yellow-400',    bg: 'bg-yellow-500/10 border-yellow-500/20'       },
  { icon: Activity,    label: 'Live On-Chain Data',   color: 'text-accent-green',  bg: 'bg-accent-green/10 border-accent-green/20'   },
];

// ── Export ────────────────────────────────────────────────────────────────────
export default function DemoSection() {
  const { connected } = useWallet();
  const [activeBotId, setActiveBotId] = useState('alpha');
  const activeBot = BOTS.find((b) => b.id === activeBotId);

  return (
    <section className="relative py-24 px-6 lg:px-10 section-divider overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <ThreeScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/55 via-transparent to-background/75 pointer-events-none" />

      <div className="relative z-10 max-w-site mx-auto">

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="badge-blue mx-auto w-fit mb-4">
            <TrendingUp size={11} />
            Live Platform Preview
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Choose Your <span className="text-gradient">Bot Strategy</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Four AI-powered bots, each with a unique strategy. All ZK-verified on-chain.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {pills.map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg} text-sm font-medium ${color}`}>
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>

        {/* Bot selector */}
        <BotSelector bots={BOTS} activeId={activeBotId} onSelect={setActiveBotId} />

        {/* Active bot dashboard */}
        <BotDashboard bot={activeBot} />

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to={connected ? '/dashboard' : '/connect'}
            className="btn-primary text-base px-8 py-4 rounded-full inline-flex"
          >
            <Activity size={18} />
            {connected ? 'Open Live Dashboard' : 'Connect Wallet to Access'}
          </Link>
          <p className="text-gray-700 text-sm mt-4 font-mono">ZK proofs verified on Sepolia</p>
        </div>
      </div>
    </section>
  );
}
