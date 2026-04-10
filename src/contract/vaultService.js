/**
 * Vault Service
 *
 * Deposit/withdraw via the Python backend which runs the Midnight Node SDK.
 * The backend uses MIDNIGHT_SEED from .env to sign transactions.
 */

const CONTRACT_ADDRESS = '52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e';
const EXPLORER = 'https://explorer.preprod.midnight.network/transactions';

function apiUrl(path) {
  return import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}${path}`
    : `/api${path}`;
}

export async function depositOnChain(walletApi, amountUnits, walletAddress = 'default') {
  const res = await fetch(apiUrl('/build-deposit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountUnits.toString(), walletAddress }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data.output
      ? data.output.split('\n').filter(l => l.includes('❌') || l.includes('Error')).slice(0, 2).join(' ')
      : data.error;
    throw new Error(detail || `Deposit failed (${res.status})`);
  }

  return data.txId;
}

export async function withdrawOnChain(walletApi, amountUnits) {
  const res = await fetch(apiUrl('/build-withdraw'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountUnits.toString() }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Withdraw failed (${res.status})`);
  }

  return data.txId;
}

export { CONTRACT_ADDRESS, EXPLORER };
