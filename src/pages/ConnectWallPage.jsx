import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, Lock, Loader2, CheckCircle, AlertCircle, ExternalLink, LogOut, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import SceneBackground from '../components/SceneBackground';

const EXPLORER = 'https://explorer.preprod.midnight.network';

const ConnectWallPage = () => {
  const navigate = useNavigate();
  const { connected, connecting, address, dustBalance, error, connect, disconnect, laceAvailable } = useWallet();

  const handleConnect = () => connect();

  const handleDisconnect = () => {
    disconnect();
  };

  // Redirect to dashboard once connected
  React.useEffect(() => {
    if (connected) {
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  }, [connected, navigate]);

  const formatDust = (val) => {
    if (val === null || val === undefined) return '—';
    const n = Number(val) / 1e15;
    return n.toFixed(4) + ' DUST';
  };

  const shortAddr = address
    ? `${address.slice(0, 14)}…${address.slice(-6)}`
    : null;

  return (
    <div className="relative flex-1 w-full flex items-center justify-center min-h-[85vh] px-6 py-12 overflow-hidden">
      <SceneBackground variant="hero" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/55 via-background/40 to-background/70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 shadow-glow-blue">
              <Wallet size={32} className="text-accent-blue" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </h1>
          <p className="text-gray-500 text-sm">
            {connected ? 'Redirecting to dashboard...' : 'Connect your Lace wallet to access AlphaVault on Midnight Preprod.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-7 space-y-5">

          {/* ── Connected state ── */}
          {connected && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="p-4 rounded-full bg-semantic-profit/15 border border-semantic-profit/30">
                <CheckCircle size={36} className="text-semantic-profit" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-semibold">Connected to Preprod</p>
                <p className="text-gray-400 text-xs font-mono">{shortAddr}</p>
                <p className="text-gray-500 text-xs">{formatDust(dustBalance)}</p>
              </div>

              {/* Explorer link */}
              {address && (
                <a
                  href={`${EXPLORER}/addresses/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-accent-blue text-xs hover:underline"
                >
                  <ExternalLink size={12} /> View on Midnight Explorer
                </a>
              )}

              {/* Disconnect button */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <LogOut size={16} /> Disconnect Wallet
              </button>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-blue to-semantic-profit rounded-full animate-[grow_1s_ease-in-out_forwards]" />
              </div>
            </div>
          )}

          {/* ── Not connected state ── */}
          {!connected && (
            <>
              {/* Lace not installed */}
              {!laceAvailable && (
                <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-yellow-300 text-sm font-medium">Lace wallet not detected</p>
                    <p className="text-gray-400 text-xs">Install Lace and enable Midnight in Settings → Beta features, then set network to Preprod.</p>
                    <a
                      href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-accent-blue text-xs hover:underline mt-1"
                    >
                      <ExternalLink size={11} /> Install Lace
                    </a>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 text-sm">{error}</p>
                    <button
                      onClick={handleConnect}
                      className="flex items-center gap-1 text-accent-blue text-xs mt-2 hover:underline"
                    >
                      <RefreshCw size={11} /> Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              <div className="space-y-2.5">
                {[
                  'Lace wallet installed in Chrome',
                  'Midnight enabled: Lace → Settings → Beta features',
                  'Network set to Preprod in Lace',
                  'DUST available from faucet.preprod.midnight.network',
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-mono shrink-0">
                      {i + 1}
                    </div>
                    {req}
                  </div>
                ))}
              </div>

              {/* Connect button */}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {connecting
                  ? <><Loader2 size={18} className="animate-spin" /> Connecting to Lace...</>
                  : <><Wallet size={18} /> Connect Lace Wallet</>}
              </button>

              {/* Faucet + Explorer links */}
              <div className="flex items-center justify-center gap-6 pt-1">
                <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-gray-500 text-xs hover:text-accent-blue transition-colors">
                  <ExternalLink size={11} /> Get DUST
                </a>
                <a href={EXPLORER} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-gray-500 text-xs hover:text-accent-blue transition-colors">
                  <ExternalLink size={11} /> Midnight Explorer
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-700 font-mono">
          <span className="flex items-center gap-1"><Lock size={10} /> Non-custodial</span>
          <span className="flex items-center gap-1"><ShieldCheck size={10} /> ZK-secured</span>
        </div>

      </div>
    </div>
  );
};

export default ConnectWallPage;
