/**
 * AlphaVault Contract API
 *
 * Off-chain interface for the AlphaVault Compact smart contract.
 * Automatically uses the real on-chain contract when a contractAddress
 * is set in deployment.json, otherwise falls back to mock mode.
 */

import { networkConfig } from './network-config.js';

// ─── Deployment info ──────────────────────────────────────────────────────────

// Set via .env after deploying: VITE_CONTRACT_ADDRESS=<address>
// Or deployment.json is served from /public after deploy
let CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? null;

if (!CONTRACT_ADDRESS) {
  try {
    const res = await fetch('/deployment.json');
    if (res.ok) {
      const data = await res.json();
      CONTRACT_ADDRESS = data.contractAddress ?? null;
    }
  } catch {
    // No deployment yet — running in mock mode
  }
}

// ─── Mock state (used before contract is deployed) ────────────────────────────

const mockState = {
  totalValueLocked: 2_450_000_000_000n, // $2.45M in USDC (6 decimals)
  verifiedApy:      1450,               // 14.50% in basis points
  investorBalances: new Map([
    ['0xabc1230000000000000000000000000000000000000000000000000000000001', 500_000_000_000n],
    ['0xabc1230000000000000000000000000000000000000000000000000000000002', 1_200_000_000_000n],
  ]),
  quantAdmin: '0xdeadbeef00000000000000000000000000000000000000000000000000000001',
};

// ─── Real contract loader ─────────────────────────────────────────────────────

let _contractModule = null;
async function getContractModule() {
  if (_contractModule) return _contractModule;
  _contractModule = await import('alpha-vault-contract');
  return _contractModule;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads the current public vault state from the ledger via the indexer.
 * Falls back to mock state if no contract is deployed yet.
 *
 * @returns {Promise<{totalValueLocked: bigint, verifiedApy: number, investorBalances: Map, quantAdmin: string}>}
 */
export async function getVaultState() {
  if (!CONTRACT_ADDRESS) {
    console.warn('[AlphaVault] No deployment found — using mock state.');
    return { ...mockState, investorBalances: new Map(mockState.investorBalances) };
  }

  try {
    const { ledger } = await getContractModule();

    // Query the indexer GraphQL for the latest contract state
    const query = `
      query {
        contract(address: "${CONTRACT_ADDRESS}") {
          state
        }
      }
    `;
    const res = await fetch(networkConfig.indexerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const { data } = await res.json();
    const onChainState = ledger(data.contract.state);

    return {
      totalValueLocked: onChainState.totalValueLocked,
      verifiedApy:      Number(onChainState.verifiedApy),
      investorBalances: new Map(onChainState.investorBalances),
      quantAdmin:       '0x' + Buffer.from(onChainState.quantAdmin).toString('hex'),
    };
  } catch (err) {
    console.error('[AlphaVault] Failed to fetch on-chain state:', err);
    return { ...mockState, investorBalances: new Map(mockState.investorBalances) };
  }
}

/**
 * Deposits tokens into the vault for a given investor.
 * In production this submits a transaction via the Lace wallet.
 *
 * @param {string} investorAddress - Hex-encoded 32-byte investor address
 * @param {bigint} amount
 * @returns {Promise<{txHash: string}>}
 */
export async function deposit(investorAddress, amount) {
  if (amount <= 0n) throw new Error('Deposit amount must be greater than zero');

  if (!CONTRACT_ADDRESS) {
    // Mock mode
    const current = mockState.investorBalances.get(investorAddress) ?? 0n;
    mockState.investorBalances.set(investorAddress, current + amount);
    mockState.totalValueLocked += amount;
    return { txHash: `mock_deposit_${Date.now()}` };
  }

  // Production: submit via Lace wallet DApp connector
  // The wallet handles proof generation against the proof server automatically.
  throw new Error(
    'Live deposit requires the Lace wallet DApp connector. ' +
    'Connect Lace to this DApp and call deposit() through the wallet API.'
  );
}

/**
 * Withdraws tokens from the vault for a given investor.
 *
 * @param {string} investorAddress
 * @param {bigint} amount
 * @returns {Promise<{txHash: string}>}
 */
export async function withdraw(investorAddress, amount) {
  if (!CONTRACT_ADDRESS) {
    const current = mockState.investorBalances.get(investorAddress) ?? 0n;
    if (current < amount) throw new Error('Insufficient funds in vault');
    mockState.investorBalances.set(investorAddress, current - amount);
    mockState.totalValueLocked -= amount;
    return { txHash: `mock_withdraw_${Date.now()}` };
  }

  throw new Error(
    'Live withdraw requires the Lace wallet DApp connector.'
  );
}

/**
 * Updates the verified APY. Only callable by the quantAdmin.
 * The ZK proof proves the caller controls the admin key without revealing it.
 *
 * @param {number} newApy - APY in basis points (e.g. 1250 = 12.50%)
 * @returns {Promise<{txHash: string}>}
 */
export async function updatePerformance(newApy) {
  if (!CONTRACT_ADDRESS) {
    mockState.verifiedApy = newApy;
    return { txHash: `mock_updateApy_${Date.now()}` };
  }

  throw new Error(
    'Live updatePerformance requires the Lace wallet DApp connector.'
  );
}

/**
 * Returns the balance of a specific investor.
 *
 * @param {string} investorAddress
 * @returns {Promise<bigint>}
 */
export async function getInvestorBalance(investorAddress) {
  if (!CONTRACT_ADDRESS) {
    return mockState.investorBalances.get(investorAddress) ?? 0n;
  }

  const state = await getVaultState();
  return state.investorBalances.get(investorAddress) ?? 0n;
}
