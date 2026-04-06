import React, { useState } from 'react';
import { BookOpen, Code, ShieldCheck, Zap, Lock, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import SceneBackground from '../components/SceneBackground';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'overview',     label: 'Overview',          icon: BookOpen   },
  { id: 'zk-proofs',   label: 'ZK Proofs',          icon: ShieldCheck },
  { id: 'api',         label: 'API Reference',       icon: Code       },
  { id: 'security',    label: 'Security',            icon: Lock       },
  { id: 'quickstart',  label: 'Quick Start',         icon: Zap        },
];

function CodeBlock({ code, lang = 'json' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
        <span className="text-gray-600 text-xs font-mono">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-gray-600 hover:text-white text-xs font-mono transition-colors">
          {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto scrollbar-thin bg-black/30 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const endpoints = [
  { method: 'GET', path: '/metrics',          desc: 'Returns APY, profit, drawdown, Sharpe ratio',   badge: 'Public'    },
  { method: 'GET', path: '/equity',           desc: 'Returns daily portfolio equity curve',           badge: 'Public'    },
  { method: 'GET', path: '/trades',           desc: 'Returns full trade history',                     badge: 'Public'    },
  { method: 'GET', path: '/allocation',       desc: 'Returns current portfolio allocation by asset',  badge: 'Public'    },
  { method: 'GET', path: '/asset-performance',desc: 'Returns PnL breakdown per asset',                badge: 'Public'    },
  { method: 'GET', path: '/risk-metrics',     desc: 'Returns win rate, profit factor, avg win/loss',  badge: 'Public'    },
];

const content = {
  overview: {
    title: 'AlphaVault Documentation',
    body: (
      <div className="space-y-6">
        <p className="text-gray-400 text-base leading-relaxed">
          AlphaVault is a privacy-preserving trading vault built on Midnight. This documentation covers the ZK proof system, API integration, security model, and how to get started as an investor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, title: 'ZK-Verified Returns',  desc: 'Every APY figure is backed by a cryptographic proof.',  color: 'text-accent-green',  bg: 'bg-accent-green/10 border-accent-green/20'  },
            { icon: Lock,        title: 'Non-Custodial',         desc: 'Your funds are controlled by audited smart contracts.', color: 'text-accent-blue',   bg: 'bg-accent-blue/10 border-accent-blue/20'    },
            { icon: Code,        title: 'Open API',              desc: 'Public REST API for all performance data.',             color: 'text-accent-indigo', bg: 'bg-accent-indigo/10 border-accent-indigo/20' },
            { icon: Zap,         title: 'Real-Time Data',        desc: 'Live on-chain data updated every block.',               color: 'text-yellow-400',    bg: 'bg-yellow-500/10 border-yellow-500/20'      },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className={`glass p-5 rounded-xl border ${bg.split(' ')[1]} flex gap-4`}>
              <div className={`p-2 rounded-lg border ${bg} shrink-0 h-fit`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'zk-proofs': {
    title: 'Zero-Knowledge Proof System',
    body: (
      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed">
          AlphaVault uses Midnight's Compact language to run ZK circuits that verify trading performance.
          The key insight: <span className="text-white">the circuit verifies the math, not the data.</span>
        </p>

        <div className="glass p-5 rounded-xl border border-accent-blue/20 space-y-2">
          <p className="text-accent-blue text-sm font-semibold">The Core Formula (verified inside ZK)</p>
          <CodeBlock lang="math" code={`APY (basis points) = (netPnL × 365 × 10000) / (capital × period)\n\nVerified without division using:\n  netPnL × 365 × 10000  ≈  newApy × capital × period\n  (within 1 basis point tolerance)\n\nIf the quant submits a wrong APY → assertion fails → proof rejected → tx reverts`} />
        </div>

        <h3 className="text-white font-bold text-lg">What Goes Into the Proof</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass p-4 rounded-xl space-y-2 border border-red-500/20">
            <p className="text-red-400 text-xs font-mono uppercase tracking-widest">Private Witnesses</p>
            {['privateNetPnl (total PnL × 1000)', 'privateCapital (capital × 1000)', 'privateTradePeriod (days)', 'privateTradeCount (# trades)', 'privateTradeHash (SHA-256 of CSV)'].map(w => (
              <p key={w} className="text-gray-400 text-xs font-mono">• {w}</p>
            ))}
          </div>
          <div className="glass p-4 rounded-xl space-y-2 border border-green-500/20">
            <p className="text-semantic-profit text-xs font-mono uppercase tracking-widest">Public Ledger State</p>
            {['verifiedApy (basis points)', 'totalTrades (count)', 'totalValueLocked', 'quantAdmin (address)', 'tradeDataCommitment (hash)'].map(w => (
              <p key={w} className="text-gray-400 text-xs font-mono">• {w}</p>
            ))}
          </div>
        </div>

        <h3 className="text-white font-bold text-lg">Proof Generation Flow</h3>
        <div className="space-y-3">
          {[
            { step: '01', title: 'Bot Trades',           desc: 'Trading bot executes strategy. Raw trade data (prices, sizes, PnL) stays local.' },
            { step: '02', title: 'Aggregate',            desc: 'Backend computes netPnL, capital, period, trade count, and SHA-256 hash of trade CSV.' },
            { step: '03', title: 'Proof Generation',     desc: 'Docker proof server generates zk-SNARK binding private aggregates to the public APY claim.' },
            { step: '04', title: 'On-Chain Verify',      desc: 'Midnight circuit verifies the math. APY + trade hash written to ledger. Raw data never exposed.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 glass p-4 rounded-xl">
              <span className="text-accent-blue font-black text-lg font-mono shrink-0">{step}</span>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-white font-bold text-lg">Live Contract on Preprod</h3>
        <CodeBlock lang="json" code={`{\n  "contractAddress": "52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e",\n  "network": "preprod",\n  "circuits": ["initialize", "deposit", "withdraw", "updatePerformance", "getBalance"],\n  "lastProofTx": "00410168a651a88c69c7580e767933fdbed39bdde558d6a92dae8b439a66ad95e8",\n  "verifiedApy": "107.96%",\n  "block": 231504\n}`} />

        <h3 className="text-white font-bold text-lg">ZK Input Structure</h3>
        <CodeBlock lang="json" code={`// alphavault-backend/data/zk_input.json\n{\n  "privateNetPnl":      266210,   // 266.21 profit × 1000\n  "privateCapital":     1000000,  // 1000 capital × 1000\n  "privateTradePeriod": 90,       // 90 day period\n  "privateTradeCount":  187,      // trades executed\n  "submittedApyBps":    10796,    // 107.96% APY\n  "tradeDataHash":      "39b94ca..." // SHA-256 of trades.csv\n}`} />
      </div>
    ),
  },
  api: {
    title: 'API Reference',
    body: (
      <div className="space-y-6">
        <div className="glass p-4 rounded-xl border border-accent-blue/20 bg-accent-blue/5">
          <p className="text-accent-blue text-sm font-mono">Base URL: <span className="text-white">http://localhost:5000</span></p>
        </div>
        <div className="space-y-3">
          {endpoints.map(({ method, path, desc, badge }) => (
            <div key={path} className="glass p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-accent-green/15 text-accent-green text-xs font-mono font-bold shrink-0">{method}</span>
              <code className="text-accent-blue font-mono text-sm shrink-0">{path}</code>
              <span className="text-gray-500 text-sm flex-1">{desc}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-[10px] font-mono shrink-0">{badge}</span>
            </div>
          ))}
        </div>
        <h3 className="text-white font-bold text-lg">Example Response — /metrics</h3>
        <CodeBlock lang="json" code={`{\n  "strategy": "Momentum + Mean Reversion Hybrid",\n  "initial_capital": 1000,\n  "final_value": 1612.00,\n  "total_profit": 612.00,\n  "apy_percent": 61.2,\n  "max_drawdown_percent": 8.4,\n  "win_rate_percent": 67.0,\n  "sharpe_ratio": 2.1,\n  "total_trades": 87\n}`} />
      </div>
    ),
  },
  security: {
    title: 'Security Model',
    body: (
      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed">AlphaVault is designed with a trust-minimised architecture. Here is what we guarantee and what you should verify yourself.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Smart Contract Audit',   desc: 'All contracts audited by independent security firms before deployment.',  status: 'Completed' },
            { title: 'Non-Custodial Design',   desc: 'AlphaVault never holds user funds. Deposits go directly to the vault contract.', status: 'By Design' },
            { title: 'ZK Proof Verification',  desc: 'Every APY claim is backed by a verifiable zk-SNARK on Sepolia testnet.',  status: 'Live' },
            { title: 'Open Source Contracts',  desc: 'All smart contract code is publicly verifiable on Etherscan.',            status: 'Public' },
            { title: 'Bug Bounty Program',     desc: 'Responsible disclosure program with rewards up to $50,000.',              status: 'Active' },
            { title: 'Multi-sig Admin',        desc: '3-of-5 multisig required for any protocol parameter changes.',            status: 'Enforced' },
          ].map(({ title, desc, status }) => (
            <div key={title} className="glass p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">{title}</p>
                <span className="px-2 py-0.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-[10px] font-mono">{status}</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  quickstart: {
    title: 'Quick Start Guide',
    body: (
      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed">Get up and running with AlphaVault in under 5 minutes.</p>
        <div className="space-y-4">
          {[
            { n: 1, title: 'Connect Your Wallet',    desc: 'Click "Connect Wallet" in the navbar. Use the demo credentials to explore the platform.', action: { label: 'Connect Now', to: '/connect' } },
            { n: 2, title: 'View the Dashboard',     desc: 'After connecting, access the full investor dashboard with live ZK-verified performance data.', action: { label: 'View Dashboard', to: '/dashboard' } },
            { n: 3, title: 'Explore the Strategy',   desc: 'Read about the Momentum + Mean Reversion hybrid strategy powering the vault.', action: { label: 'Read Strategy', to: '/strategy' } },
            { n: 4, title: 'Check Analytics',        desc: 'Deep-dive into 15 months of verified performance charts and statistics.', action: { label: 'View Analytics', to: '/analytics' } },
          ].map(({ n, title, desc, action }) => (
            <div key={n} className="glass p-6 rounded-xl flex gap-5 items-start">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-bold text-sm shrink-0">{n}</div>
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{desc}</p>
                <Link to={action.to} className="inline-flex items-center gap-1.5 text-accent-blue text-sm font-medium hover:underline">
                  {action.label} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <h3 className="text-white font-bold text-lg">Run the Backend</h3>
        <CodeBlock lang="bash" code={`# Install dependencies\npip install -r requirements.txt\n\n# Generate simulation data\npython -m scripts.run_simulation\n\n# Start API server (port 5000)\npython api/server.py`} />
      </div>
    ),
  },
};

export default function DocsPage() {
  const [active, setActive] = useState('overview');
  const current = content[active];

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <SceneBackground variant="subtle" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/70 via-background/50 to-background/70 pointer-events-none" />

      <div className="relative z-10 max-w-site mx-auto px-6 lg:px-10 py-20">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Sidebar ── */}
          <aside className="lg:w-56 shrink-0">
            <div className="badge-blue w-fit mb-4">Documentation</div>
            <h1 className="text-2xl font-extrabold text-white mb-6">Docs</h1>
            <nav className="space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    active === id
                      ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 glass p-4 rounded-xl space-y-2">
              <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">External</p>
              {[
                { label: 'GitHub Repo',     href: 'https://github.com/neelpote/AlphaVault-fork' },
                { label: 'Preprod Explorer', href: 'https://explorer.preprod.midnight.network' },
                { label: 'Live Contract',   href: 'https://explorer.preprod.midnight.network/contracts/52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e' },
                { label: 'Proof Tx',        href: 'https://explorer.preprod.midnight.network/transactions/00410168a651a88c69c7580e767933fdbed39bdde558d6a92dae8b439a66ad95e8' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-mono transition-colors">
                  <ExternalLink size={11} />
                  {label}
                </a>
              ))}
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">{current.title}</h2>
            {current.body}
          </main>
        </div>
      </div>
    </div>
  );
}
