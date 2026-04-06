import React from 'react';
import { ShieldCheck, TrendingUp, Coins } from 'lucide-react';

/**
 * Displays on-chain vault state sourced from the AlphaVault Compact contract.
 * @param {{ tvl: bigint, apy: number, admin: string }} props
 */
const VaultStatus = ({ tvl, apy, admin }) => {
  const formatTvl = (val) => {
    if (val === undefined || val === null) return '—';
    // Assume 6 decimal places (like USDC)
    const num = Number(BigInt(val)) / 1_000_000;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatApy = (val) => {
    if (!val && val !== 0) return '—';
    // Stored as basis points (e.g. 1250 = 12.50%)
    return (val / 100).toFixed(2) + '%';
  };

  const shortAdmin = admin
    ? `${admin.slice(0, 6)}…${admin.slice(-4)}`
    : '—';

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-accent-blue" />
        <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
          On-Chain Vault State
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TVL */}
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs uppercase tracking-wider">
            <Coins size={12} />
            Total Value Locked
          </div>
          <span className="text-white font-mono text-lg font-bold">
            {formatTvl(tvl)}
          </span>
        </div>

        {/* Verified APY */}
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs uppercase tracking-wider">
            <TrendingUp size={12} />
            ZK-Verified APY
          </div>
          <span className="text-semantic-profit font-mono text-lg font-bold">
            {formatApy(apy)}
          </span>
        </div>

        {/* Admin */}
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs uppercase tracking-wider">
            <ShieldCheck size={12} />
            Quant Admin
          </div>
          <span className="text-gray-300 font-mono text-sm truncate" title={admin}>
            {shortAdmin}
          </span>
        </div>
      </div>

      <p className="text-gray-500 text-xs">
        APY is cryptographically verified on the Midnight Network via zk-SNARK proof.
        Raw trade data is never exposed on-chain.
      </p>
    </div>
  );
};

export default VaultStatus;
