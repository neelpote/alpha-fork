/**
 * AlphaVault — Update Performance Script
 * Reads zk_input.json from the backend and calls updatePerformance()
 * on the live contract, submitting a ZK proof of the trading APY.
 *
 * Run after the trading bot completes a session:
 *   node scripts/update-performance.mjs
 */

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import * as Rx from 'rxjs';
import path from 'node:path';
import fs from 'node:fs';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import { mnemonicToSeedSync } from 'bip39';

globalThis.WebSocket = WebSocket;

const NETWORK_ID   = 'preprod';
const INDEXER      = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS   = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const NODE         = 'https://rpc.preprod.midnight.network';
const PROOF_SERVER = 'http://127.0.0.1:6300';

const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
const CONTRACT_ADDRESS = deployment.contractAddress;

// Load ZK input from backend
const zkInput = JSON.parse(fs.readFileSync('alphavault-backend/data/zk_input.json', 'utf8'));
console.log('\n📊 ZK Input loaded:');
console.log(`   Net PnL      : ${zkInput.privateNetPnl} (fixed point)`);
console.log(`   Capital      : ${zkInput.privateCapital} (fixed point)`);
console.log(`   Period       : ${zkInput.privateTradePeriod} days`);
console.log(`   Trade Count  : ${zkInput.privateTradeCount}`);
console.log(`   APY (bps)    : ${zkInput.submittedApyBps} = ${(zkInput.submittedApyBps / 100).toFixed(2)}%\n`);

function deriveKeysFromSeed(seedHex) {
  const hd = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hd.hdWallet.selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear();
  return result.keys;
}

function signTransactionIntents(tx, signFn, proofMarker) {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize('signature', proofMarker, 'pre-binding', intent.serialize());
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_, i) =>
        cloned.fallibleUnshieldedOffer.signatures.at(i) ?? signature);
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_, i) =>
        cloned.guaranteedUnshieldedOffer.signatures.at(i) ?? signature);
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

async function createWalletProvider(ctx) {
  const state = await Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter(s => s.isSynced)));
  return {
    getCoinPublicKey()       { return state.shielded.coinPublicKey.toHexString(); },
    getEncryptionPublicKey() { return state.shielded.encryptionPublicKey.toHexString(); },
    async balanceTx(tx, ttl) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: ctx.shieldedSecretKeys, dustSecretKey: ctx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = p => ctx.unshieldedKeystore.signData(p);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) { return ctx.wallet.submitTransaction(tx); },
  };
}

async function main() {
  console.log('🔐 AlphaVault — Submit Performance Proof\n');

  const mnemonic = process.env.MIDNIGHT_SEED;
  if (!mnemonic) { console.error('❌ Set MIDNIGHT_SEED env var'); process.exit(1); }

  const seedBuf = mnemonicToSeedSync(mnemonic.trim());
  const seedHex = seedBuf.slice(0, 32).toString('hex');

  setNetworkId(NETWORK_ID);

  const zkConfigPath = path.resolve('contracts', 'managed', 'alpha-vault');
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));

  // Admin address bytes (same as used during deploy)
  const adminBytes = new Uint8Array(32).fill(0);

  const compiledContract = CompiledContract.make('alpha-vault', contractModule.Contract).pipe(
    CompiledContract.withWitnesses({
      // Admin identity witness
      callerAddress: ({ privateState }) => [privateState, adminBytes],
      // Private trade data witnesses — from zk_input.json
      privateNetPnl:      ({ privateState }) => [privateState, BigInt(zkInput.privateNetPnl)],
      privateCapital:     ({ privateState }) => [privateState, BigInt(zkInput.privateCapital)],
      privateTradePeriod: ({ privateState }) => [privateState, BigInt(zkInput.privateTradePeriod)],
      privateTradeCount:  ({ privateState }) => [privateState, BigInt(zkInput.privateTradeCount)],
      // Trade data commitment — SHA-256 hash of the trade CSV
      // This hash is published on-chain so investors can audit it
      privateTradeHash:   ({ privateState }) => {
        const hashBytes = Buffer.from(zkInput.tradeDataHash, 'hex');
        const arr = new Uint8Array(32);
        arr.set(hashBytes.slice(0, 32));
        return [privateState, arr];
      },
    }),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const keys = deriveKeysFromSeed(seedHex);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey      = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const sharedIndexer = { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS };
  const nodeWs = NODE.replace(/^https/, 'wss').replace(/^http/, 'ws');

  console.log('🌐 Connecting wallet...');
  const wallet = await WalletFacade.init({
    configuration: {
      networkId: getNetworkId(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
      relayURL: new URL(nodeWs),
      provingServerUrl: new URL(PROOF_SERVER),
      indexerClientConnection: sharedIndexer,
      txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    },
    shielded:   cfg => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: cfg => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust:       cfg => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('⏳ Syncing...');
  await Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5000), Rx.filter(s => s.isSynced)));
  console.log('✅ Synced');

  const walletProvider = await createWalletProvider({ wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore });
  const accountId = walletProvider.getCoinPublicKey();
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'alphavault-private-state',
      accountId,
      privateStoragePasswordProvider: () => `${Buffer.from(accountId, 'hex').toString('base64')}!`,
    }),
    publicDataProvider:  indexerPublicDataProvider(INDEXER, INDEXER_WS),
    zkConfigProvider,
    proofProvider:       httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
    walletProvider,
    midnightProvider:    walletProvider,
  };

  console.log('🔍 Finding deployed contract...');
  const deployed = await findDeployedContract(providers, {
    contractAddress: CONTRACT_ADDRESS,
    compiledContract,
    privateStateId: 'alphavaultState',
    initialPrivateState: {},
  });

  console.log(`\n🚀 Submitting ZK performance proof...`);
  console.log(`   APY: ${(zkInput.submittedApyBps / 100).toFixed(2)}% (${zkInput.submittedApyBps} bps)`);
  console.log(`   The ZK proof will verify the APY matches the private trade data.\n`);

  const result = await deployed.callTx.updatePerformance(
    BigInt(zkInput.submittedApyBps),
    BigInt(zkInput.privateTradeCount),
  );

  const txId = result.public.txId;
  console.log('\n✅ PERFORMANCE PROOF SUBMITTED!');
  console.log(`   Transaction ID : ${txId}`);
  console.log(`   Block Height   : ${result.public.blockHeight}`);
  console.log(`   Verified APY   : ${(zkInput.submittedApyBps / 100).toFixed(2)}%`);
  console.log(`\n🔍 https://explorer.preprod.midnight.network/transactions/${txId}\n`);

  await wallet.stop();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ FAILED:', err.message ?? err);
  process.exit(1);
});
