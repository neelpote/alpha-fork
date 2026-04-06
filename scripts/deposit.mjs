/**
 * AlphaVault — Deposit Script
 * Calls the deposit() circuit on the deployed contract and prints the tx ID.
 *
 * Usage:
 *   MIDNIGHT_SEED="..." AMOUNT=1000000 node scripts/deposit.mjs
 *
 * AMOUNT is in smallest units (e.g. 1000000 = 1 token with 6 decimals)
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

// Load deployment
const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
const CONTRACT_ADDRESS = deployment.contractAddress;
const AMOUNT = BigInt(process.env.AMOUNT ?? '1000000'); // default 1 token

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
  console.log('\n💰 AlphaVault — Deposit\n');
  console.log(`   Contract : ${CONTRACT_ADDRESS}`);
  console.log(`   Amount   : ${AMOUNT.toLocaleString()} units\n`);

  // Seed
  const mnemonic = process.env.MIDNIGHT_SEED;
  if (!mnemonic) { console.error('❌ Set MIDNIGHT_SEED env var'); process.exit(1); }
  const seedBuf = mnemonicToSeedSync(mnemonic.trim());
  const seedHex = seedBuf.slice(0, 32).toString('hex');

  setNetworkId(NETWORK_ID);

  // Load contract
  const zkConfigPath = path.resolve('contracts', 'managed', 'alpha-vault');
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));

  const compiledContract = CompiledContract.make('alpha-vault', contractModule.Contract).pipe(
    CompiledContract.withWitnesses({
      callerAddress:      ({ privateState }) => [privateState, new Uint8Array(32).fill(0)],
      privateNetPnl:      ({ privateState }) => [privateState, 0n],
      privateCapital:     ({ privateState }) => [privateState, 1n],
      privateTradePeriod: ({ privateState }) => [privateState, 90],
      privateTradeCount:  ({ privateState }) => [privateState, 0],
      privateTradeHash:   ({ privateState }) => [privateState, new Uint8Array(32)],
    }),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  // Wallet
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

  // Find the deployed contract
  console.log('🔍 Finding deployed contract...');
  const deployedContract = await findDeployedContract(providers, {
    contractAddress: CONTRACT_ADDRESS,
    compiledContract,
    privateStateId: 'alphavaultState',
    initialPrivateState: {},
  });

  // Get investor address bytes (use coin public key as investor ID)
  const investorBytes = Buffer.from(accountId, 'hex').slice(0, 32);
  const investorArr   = new Uint8Array(32);
  investorArr.set(investorBytes.slice(0, Math.min(32, investorBytes.length)));

  // Call deposit circuit
  console.log(`\n🚀 Calling deposit(${investorArr.slice(0,4).join(',')}.., ${AMOUNT})...`);
  const result = await deployedContract.callTx.deposit(investorArr, AMOUNT);

  const txId      = result.public.txId;
  const blockHeight = result.public.blockHeight;

  console.log('\n✅ DEPOSIT SUCCESSFUL!');
  console.log(`   Transaction ID : ${txId}`);
  console.log(`   Block Height   : ${blockHeight}`);
  console.log(`   Amount         : ${AMOUNT.toLocaleString()} units`);
  console.log(`\n🔍 Verify on explorer:`);
  console.log(`   https://explorer.preprod.midnight.network/transactions/${txId}\n`);

  await wallet.stop();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ FAILED:', err.message ?? err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
