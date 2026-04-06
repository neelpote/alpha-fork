import React from 'react';
import { Shield, ShieldCheck, Lock, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="section-divider bg-background/80 backdrop-blur-sm mt-auto">
    <div className="max-w-site mx-auto px-6 lg:px-10 pt-16 pb-8">

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* Brand + about */}
        <div className="lg:col-span-1 space-y-5">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="p-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 group-hover:shadow-glow-blue transition-all duration-300">
              <Shield className="text-accent-blue" size={18} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Alpha<span className="text-gradient-blue">Vault</span>
            </span>
          </Link>

          <p className="text-gray-500 text-sm leading-relaxed">
            AlphaVault is a privacy-preserving trading vault that proves performance
            on-chain using Zero-Knowledge proofs — without ever revealing the strategy.
          </p>

          {/* Trust badges */}
          <div className="space-y-2">
            {[
              { icon: ShieldCheck, text: 'ZK-Verified Returns',   color: 'text-accent-green'  },
              { icon: Lock,        text: 'Non-Custodial Vault',    color: 'text-accent-blue'   },
              { icon: Zap,         text: 'AI-Powered Strategy',    color: 'text-yellow-400'    },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={13} className={color} />
                <span className="text-gray-500 text-xs font-mono">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="space-y-5">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">About</h4>
          <ul className="space-y-3">
            {[
              { label: 'How It Works',       to: '/workflow'  },
              { label: 'ZK Proof System',    to: '/workflow'  },
              { label: 'Trading Strategy',   to: '/workflow'  },
              { label: 'Smart Contracts',    to: '/workflow'  },
              { label: 'Security Model',     to: '/workflow'  },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent-blue transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div className="space-y-5">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">Platform</h4>
          <ul className="space-y-3">
            {[
              { label: 'Dashboard',        to: '/dashboard' },
              { label: 'Analytics',        to: '/analytics' },
              { label: 'Strategy',         to: '/strategy'  },
              { label: 'Connect Wallet',   to: '/connect'   },
              { label: 'Documentation',    to: '/docs'      },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent-blue transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources + socials */}
        <div className="space-y-5">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">Resources</h4>
          <ul className="space-y-3">
            {[
              { label: 'Documentation',  to: '/docs'     },
              { label: 'How It Works',   to: '/workflow' },
              { label: 'ZK Whitepaper',  to: '/docs'     },
              { label: 'API Reference',  to: '/docs'     },
              { label: 'Explorer',       href: 'https://explorer.preprod.midnight.network' },
            ].map(({ label, to, href }) => (
              <li key={label}>
                {to ? (
                  <Link to={to} className="text-gray-500 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent-blue transition-colors" />
                    {label}
                  </Link>
                ) : (
                  <a href={href} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent-blue transition-colors" />
                    {label}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity ml-auto" />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Social icons */}
          <div className="pt-2">
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Community</h4>
            <div className="flex items-center gap-2">
              {[
                { label: 'GitHub', href: 'https://github.com/neelpote/AlphaVault-fork', icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )},
                { label: 'Twitter', href: '#', icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )},
                { label: 'Discord', href: '#', icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                )},
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-white/5 mb-6" />

      {/* ── Bottom bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-xs font-mono">
          &copy; {new Date().getFullYear()} AlphaVault. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {['Privacy Policy', 'Terms of Service'].map((item) => (
            <a key={item} href="#" className="text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-gray-600 text-xs font-mono">ZK Proofs Live on Midnight Preprod</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
