/**
 * Vault Service
 *
 * Deposit/withdraw via the Python backend which runs the Midnight Node SDK.
 * The backend uses MIDNIGHT_SEED from .env to sign transactions.
 */

const CONTRACT_ADDRESS = '49ef75e47587658b9791bde9c9542eacb6442240822ac831836f9089525872b7';
const EXPLORER = 'https://explorer.preprod.midnight.network/transactions';

export async function depositOnChain(walletApi, amountUnits) {
  const res = await fetch('/api/build-deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountUnits.toString() }),
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
  const res = await fetch('/api/build-withdraw', {
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
