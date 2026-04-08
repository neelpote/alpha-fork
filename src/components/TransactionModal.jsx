import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const EXPLORER = 'https://explorer.preprod.midnight.network/transactions';

const TransactionModal = ({ type, onClose, onSubmit, txState, walletConnected }) => {
  const [amount, setAmount] = useState('');
  const isDeposit = type === 'deposit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    // Convert to smallest units (6 decimals)
    const units = Math.floor(Number(amount) * 1_000_000);
    await onSubmit(units);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDeposit
              ? <ArrowDownCircle size={20} className="text-semantic-profit" />
              : <ArrowUpCircle  size={20} className="text-red-400" />}
            <h2 className="text-white font-semibold text-lg">
              {isDeposit ? 'Deposit to Vault' : 'Withdraw from Vault'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Idle / Input state */}
        {txState.status === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Amount (NIGHT)</label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-accent-blue"
              />
            </div>
            {!walletConnected && (
              <p className="text-yellow-400 text-xs">Connect your Lace wallet first.</p>
            )}
            <button
              type="submit"
              disabled={!walletConnected || !amount || Number(amount) <= 0}
              className="w-full py-3 rounded-xl font-semibold text-white bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isDeposit ? 'Deposit' : 'Withdraw'}
            </button>
          </form>
        )}

        {/* Loading state */}
        {txState.status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 size={40} className="animate-spin text-accent-blue" />
            <p className="text-white font-medium">Waiting for Lace approval...</p>
            <p className="text-gray-400 text-sm text-center">
              Check your Lace wallet popup. Proof generation takes 30-60 seconds.
            </p>
          </div>
        )}

        {/* Success state */}
        {txState.status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={40} className="text-semantic-profit" />
            <p className="text-white font-semibold">Transaction Confirmed!</p>
            <p className="text-gray-400 text-xs font-mono text-center break-all">
              {txState.txId}
            </p>
            <a
              href={`${EXPLORER}/${txState.txId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-accent-blue text-sm hover:underline"
            >
              <ExternalLink size={14} /> View on Midnight Explorer
            </a>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
              Close
            </button>
          </div>
        )}

        {/* Error state */}
        {txState.status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-white font-semibold">Transaction Failed</p>
            <p className="text-red-400 text-sm text-center">{txState.error}</p>
            <button
              onClick={() => onSubmit(null)} // retry signal
              className="w-full py-3 rounded-xl bg-accent-blue text-white hover:bg-accent-blue/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionModal;
