/**
 * useVaultContract
 * Hook for reading vault state and executing deposit/withdraw on the live contract.
 */
import { useState, useCallback, useEffect } from 'react';

const CONTRACT_ADDRESS = '52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e';
const INDEXER = 'https://indexer.preprod.midnight.network/api/v3/graphql';

// ── Read vault state from indexer ────────────────────────────────────────────

async function fetchVaultState() {
  try {
    const res = await fetch(INDEXER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          contractState(address: "${CONTRACT_ADDRESS}") {
            state
          }
        }`,
      }),
    });
    const { data } = await res.json();
    if (!data?.contractState?.state) return null;

    let contractModule;
    try { contractModule = await import('alpha-vault-contract'); }
    catch { return null; }
    if (!contractModule.ledger) return null;
    const onChain = contractModule.ledger(data.contractState.state);
    return {
      totalValueLocked: onChain.totalValueLocked,
      verifiedApy:      Number(onChain.verifiedApy),
      totalTrades:      Number(onChain.totalTrades),
      quantAdmin:       '0x' + Buffer.from(onChain.quantAdmin).toString('hex'),
    };
  } catch (err) {
    console.warn('Could not fetch vault state:', err.message);
    return null;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useVaultContract(walletApi) {
  const [vaultState, setVaultState]   = useState(null);
  const [txState, setTxState]         = useState({ status: 'idle', txId: null, error: null });
  const [investorBalance, setInvestorBalance] = useState(null);

  // Poll vault state every 30s
  useEffect(() => {
    fetchVaultState().then(setVaultState);
    const interval = setInterval(() => fetchVaultState().then(setVaultState), 30000);
    return () => clearInterval(interval);
  }, []);

  const deposit = useCallback(async (amountUnits) => {
    if (!walletApi) throw new Error('Wallet not connected');
    setTxState({ status: 'loading', txId: null, error: null });

    try {
      const { CompiledContract }           = await import('@midnight-ntwrk/compact-js');
      const { findDeployedContract }       = await import('@midnight-ntwrk/midnight-js-contracts');
      const { setNetworkId }               = await import('@midnight-ntwrk/midnight-js-network-id');
      const { FetchZkConfigProvider }      = await import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
      const { indexerPublicDataProvider }  = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
      let contractModule;
      try { contractModule = await import('alpha-vault-contract'); }
      catch { throw new Error('Contract not compiled. Run: compact compile -- contracts/alpha-vault.compact contracts/managed/alpha-vault'); }

      setNetworkId('preprod');
      const shieldedAddrs = await walletApi.getShieldedAddresses();
      const coinPublicKey = shieldedAddrs.coinPublicKey;

      const adminBytes = new Uint8Array(32).fill(0);
      const compiledContract = CompiledContract.make('alpha-vault', contractModule.Contract).pipe(
        CompiledContract.withWitnesses({
          callerAddress:      ({ privateState }) => [privateState, adminBytes],
          privateNetPnl:      ({ privateState }) => [privateState, 0n],
          privateCapital:     ({ privateState }) => [privateState, 1n],
          privateTradePeriod: ({ privateState }) => [privateState, 90],
          privateTradeCount:  ({ privateState }) => [privateState, 0],
        }),
      );

      const zkConfigProvider = new FetchZkConfigProvider(
        window.location.origin + '/contracts/managed/alpha-vault',
        fetch.bind(window)
      );
      const provingProvider   = walletApi.getProvingProvider(zkConfigProvider);
      const publicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri);

      const walletProvider = {
        getCoinPublicKey:       () => coinPublicKey,
        getEncryptionPublicKey: () => shieldedAddrs.encryptionPublicKey,
        balanceTx: async (tx) => {
          const result = await walletApi.balanceUnsealedTransaction(tx);
          return result.tx ?? result;
        },
        submitTx: (tx) => walletApi.submitTransaction(tx),
      };

      const providers = {
        zkConfigProvider,
        proofProvider:        provingProvider,
        publicDataProvider,
        walletProvider,
        midnightProvider:     walletProvider,
        privateStateProvider: { get: () => Promise.resolve({}), set: () => Promise.resolve() },
      };

      const deployed = await findDeployedContract(providers, {
        contractAddress: CONTRACT_ADDRESS,
        compiledContract,
        privateStateId: 'alphavaultState',
        initialPrivateState: {},
      });

      // Investor bytes from coin public key
      const investorBytes = new Uint8Array(32);
      const keyBytes = Buffer.from(coinPublicKey, 'hex');
      investorBytes.set(keyBytes.slice(0, Math.min(32, keyBytes.length)));

      const result = await deployed.callTx.deposit(investorBytes, BigInt(amountUnits));
      const txId   = result.public.txId;

      setTxState({ status: 'success', txId, error: null });
      fetchVaultState().then(setVaultState);
      return txId;

    } catch (err) {
      const error = err.message?.includes('rejected') || err.message?.includes('cancel')
        ? 'Transaction rejected by user'
        : err.message ?? 'Transaction failed';
      setTxState({ status: 'error', txId: null, error });
      throw err;
    }
  }, [walletApi]);

  const withdraw = useCallback(async (amountUnits) => {
    if (!walletApi) throw new Error('Wallet not connected');
    setTxState({ status: 'loading', txId: null, error: null });

    try {
      // Same provider setup as deposit — abbreviated for clarity
      const { CompiledContract }           = await import('@midnight-ntwrk/compact-js');
      const { findDeployedContract }       = await import('@midnight-ntwrk/midnight-js-contracts');
      const { setNetworkId }               = await import('@midnight-ntwrk/midnight-js-network-id');
      const { FetchZkConfigProvider }      = await import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
      const { indexerPublicDataProvider }  = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
      let contractModule;
      try { contractModule = await import('alpha-vault-contract'); }
      catch { throw new Error('Contract not compiled. Run: compact compile -- contracts/alpha-vault.compact contracts/managed/alpha-vault'); }

      setNetworkId('preprod');
      const config        = await walletApi.getConfiguration();
      const shieldedAddrs = await walletApi.getShieldedAddresses();
      const coinPublicKey = shieldedAddrs.coinPublicKey;
      const adminBytes    = new Uint8Array(32).fill(0);

      const compiledContract = CompiledContract.make('alpha-vault', contractModule.Contract).pipe(
        CompiledContract.withWitnesses({
          callerAddress:      ({ privateState }) => [privateState, adminBytes],
          privateNetPnl:      ({ privateState }) => [privateState, 0n],
          privateCapital:     ({ privateState }) => [privateState, 1n],
          privateTradePeriod: ({ privateState }) => [privateState, 90],
          privateTradeCount:  ({ privateState }) => [privateState, 0],
        }),
      );

      const zkConfigProvider   = new FetchZkConfigProvider(
        window.location.origin + '/contracts/managed/alpha-vault', fetch.bind(window));
      const provingProvider    = walletApi.getProvingProvider(zkConfigProvider);
      const publicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri);
      const walletProvider     = {
        getCoinPublicKey:       () => coinPublicKey,
        getEncryptionPublicKey: () => shieldedAddrs.encryptionPublicKey,
        balanceTx: async (tx) => { const r = await walletApi.balanceUnsealedTransaction(tx); return r.tx ?? r; },
        submitTx:  (tx) => walletApi.submitTransaction(tx),
      };
      const providers = {
        zkConfigProvider, proofProvider: provingProvider, publicDataProvider,
        walletProvider, midnightProvider: walletProvider,
        privateStateProvider: { get: () => Promise.resolve({}), set: () => Promise.resolve() },
      };

      const deployed = await findDeployedContract(providers, {
        contractAddress: CONTRACT_ADDRESS, compiledContract,
        privateStateId: 'alphavaultState', initialPrivateState: {},
      });

      const investorBytes = new Uint8Array(32);
      const keyBytes = Buffer.from(coinPublicKey, 'hex');
      investorBytes.set(keyBytes.slice(0, Math.min(32, keyBytes.length)));

      const result = await deployed.callTx.withdraw(investorBytes, BigInt(amountUnits));
      const txId   = result.public.txId;

      setTxState({ status: 'success', txId, error: null });
      fetchVaultState().then(setVaultState);
      return txId;

    } catch (err) {
      const error = err.message?.includes('rejected') ? 'Transaction rejected by user' : err.message ?? 'Failed';
      setTxState({ status: 'error', txId: null, error });
      throw err;
    }
  }, [walletApi]);

  const resetTx = useCallback(() => {
    setTxState({ status: 'idle', txId: null, error: null });
  }, []);

  return { vaultState, txState, investorBalance, deposit, withdraw, resetTx };
}
