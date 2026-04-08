import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Wallet, Menu, X, LogOut } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { connected, address, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-accent-blue bg-accent-blue/8'
      : 'text-gray-400 hover:text-white hover:bg-white/5';

  const navLinks = [
    { to: '/',           label: 'Home'      },
    { to: '/workflow',   label: 'About'     },
    { to: '/strategy',   label: 'Strategy'  },
    { to: '/analytics',  label: 'Analytics' },
    { to: '/docs',       label: 'Docs'      },
    { to: '/submit-bot', label: 'Submit Bot' },
    ...(connected ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  const handleWallet = () => {
    if (connected) { disconnect(); navigate('/'); }
    else navigate('/connect');
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'glass border-b border-white/5' : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-site mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 group-hover:shadow-glow-blue transition-all duration-300">
            <Shield className="text-accent-blue" size={24} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-extrabold text-xl tracking-tight">
              Alpha<span className="text-gradient-blue">Vault</span>
            </span>
            <span className="text-gray-600 text-[10px] font-mono tracking-widest hidden sm:block">
              ZK-VERIFIED TRADING
            </span>
          </div>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${isActive(to)}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3 shrink-0">
          {connected ? (
            <div className="flex items-center gap-3">
              {/* Address pill */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-green/10 border border-accent-green/20">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse shrink-0" />
                <span className="text-accent-green text-sm font-mono">{address}</span>
              </div>
              {/* Disconnect */}
              <button
                onClick={handleWallet}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-semantic-loss border border-white/10 hover:border-semantic-loss/30 bg-white/3 hover:bg-semantic-loss/5 transition-all duration-200"
                title="Disconnect wallet"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleWallet}
              className="btn-primary text-base px-6 py-3 rounded-xl"
            >
              <Wallet size={18} />
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-5 border-t border-white/5 pt-4 flex flex-col gap-1.5">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${isActive(to)}`}
            >
              {label}
            </Link>
          ))}
          {/* Wallet action in drawer */}
          {connected ? (
            <>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/20 mt-1">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-accent-green text-sm font-mono truncate">{address}</span>
              </div>
              <button
                onClick={() => { handleWallet(); setMenuOpen(false); }}
                className="mt-1 px-4 py-3 rounded-xl text-base font-semibold text-semantic-loss text-left flex items-center gap-2"
              >
                <LogOut size={16} />
                Disconnect Wallet
              </button>
            </>
          ) : (
            <button
              onClick={() => { handleWallet(); setMenuOpen(false); }}
              className="btn-primary mt-2 py-3 rounded-xl text-base w-full"
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
