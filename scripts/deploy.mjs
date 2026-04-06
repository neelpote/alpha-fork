/**
 * AlphaVault Deploy Script
 * Based on the working pattern from https://github.com/Debanjannnn/Midnight-Fix
 *
 * Prerequisites:
 *   1. Docker running with proof server:
 *      docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
 *
 *   2. A wallet with tNIGHT on Preprod.
 *      Create one with: npx nightforge wallet create
 *      OR provide seed via MIDNIGHT_SEED env var.
 *      Fund at: https://faucet.preprod.midnight.network
 *
 * Usage:
 *   MIDNIGHT_SEED="word1 word2 ... word24" node scripts/deploy.mjs
 *   OR (if using nightforge wallet):
 *   node scripts/deploy.mjs
 */

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
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
import { createInterface } from 'node:readline';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import { mnemonicToSeedSync } from 'bip39';

globalThis.WebSocket = WebSocket;

const NETWORK_ID   = 'preprod';
const INDEXER      = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS   = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const NODE         = 'https://rpc.preprod.midnight.network';
const PROOF_SERVER = 'http://127.0.0.1:6300';

async function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(q, a => { rl.close(); r(a.trim()); }));
}

function deriveKeysFromSeed(seedHex) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
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

async function createWalletAndMidnightProvider(ctx) {
  const state = await Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  return {
    getCoinPublicKey() { return state.shielded.coinPublicKey.toHexString(); },
    getEncryptionPublicKey() { return state.shielded.encryptionPublicKey.toHexString(); },
    async balanceTx(tx, ttl) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: ctx.shieldedSecretKeys, dustSecretKey: ctx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = (payload) => ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) { return ctx.wallet.submitTransaction(tx); },
  };
}

async function deploy() {
  console.log('\n🔐 AlphaVault — Midnight Preprod Deployment\n');

  // ── Get seed ──────────────────────────────────────────────────────
  let seedHex;

  // Option 1: mnemonic from env
  if (process.env.MIDNIGHT_SEED) {
    const mnemonic = process.env.MIDNIGHT_SEED.trim();
    const seedBuf = mnemonicToSeedSync(mnemonic);
    seedHex = seedBuf.slice(0, 32).toString('hex'); // use first 32 bytes
    console.log('✅ Using seed from MIDNIGHT_SEED env var');
  }
  // Option 2: nightforge wallet file
  else {
    const walletDir = path.join(process.env.HOME, '.nightforge', 'wallets');
    if (fs.existsSync(walletDir) && fs.readdirSync(walletDir).length > 0) {
      const walletFile = fs.readdirSync(walletDir)[0];
      const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, walletFile), 'utf8'));
      seedHex = walletData.seed;
      console.log(`✅ Using nightforge wallet: ${walletData.name} | ${walletData.address}`);
    }
    // Option 3: prompt
    else {
      const mnemonic = await prompt('Enter seed phrase (or hex seed): ');
      if (mnemonic.includes(' ')) {
        const seedBuf = mnemonicToSeedSync(mnemonic);
        seedHex = seedBuf.slice(0, 32).toString('hex');
      } else {
        seedHex = mnemonic;
      }
    }
  }

  if (!seedHex) { console.error('❌ No seed provided.'); process.exit(1); }

  setNetworkId(NETWORK_ID);

  // ── Load contract ─────────────────────────────────────────────────
  const zkConfigPath = path.resolve('contracts', 'managed', 'alpha-vault');
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));

  const adminBytes = new Uint8Array(32).fill(0);

  const compiledContract = CompiledContract.make('alpha-vault', contractModule.Contract).pipe(
    CompiledContract.withWitnesses({
      callerAddress:      ({ privateState }) => [privateState, adminBytes],
      privateNetPnl:      ({ privateState }) => [privateState, 0n],
      privateCapital:     ({ privateState }) => [privateState, 1n],
      privateTradePeriod: ({ privateState }) => [privateState, 90],
      privateTradeCount:  ({ privateState }) => [privateState, 0],
      privateTradeHash:   ({ privateState }) => [privateState, new Uint8Array(32)],
    }),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
  console.log('✅ Contract loaded');

  // ── Derive keys ───────────────────────────────────────────────────
  const keys = deriveKeysFromSeed(seedHex);
  const shieldedSecretKeys  = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey       = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore  = createKeystore(keys[Roles.NightExternal], getNetworkId());

  // ── Build wallet ──────────────────────────────────────────────────
  const sharedIndexer = { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS };
  const nodeWs = NODE.replace(/^https/, 'wss').replace(/^http/, 'ws');

  console.log('🌐 Initializing wallet...');
  const wallet = await WalletFacade.init({
    configuration: {
      networkId: getNetworkId(),
      costParameters: { additionalFeeOverhead: 3_000_000_000_000_000n, feeBlocksMargin: 10 },
      relayURL: new URL(nodeWs),
      provingServerUrl: new URL(PROOF_SERVER),
      indexerClientConnection: sharedIndexer,
      txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    },
    shielded:   (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust:       (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('✅ Wallet started. Syncing (may take 1-2 min)...');

  await Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5000), Rx.filter((s) => s.isSynced)));
  console.log('✅ Wallet synced');

  let state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const balance = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`   Unshielded address: ${unshieldedKeystore.getBech32Address()}`);
  console.log(`   tNIGHT balance: ${balance.toLocaleString()}`);

  if (balance === 0n) {
    console.log('\n⚠️  No tNIGHT found. Fund your wallet:');
    console.log(`   1. Go to https://faucet.preprod.midnight.network`);
    console.log(`   2. Paste this address: ${unshieldedKeystore.getBech32Address()}`);
    console.log(`   3. Request tNIGHT, wait 2-3 minutes, then re-run this script.\n`);
    await wallet.stop();
    process.exit(1);
  }
  if (state.dust.availableCoins.length === 0) {
    const nightUtxos = state.unshielded.availableCoins.filter(
      (c) => c.meta?.registeredForDustGeneration !== true
    );
    if (nightUtxos.length > 0) {
      console.log(`📝 Registering ${nightUtxos.length} NIGHT UTXO(s) for DUST generation...`);
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos, unshieldedKeystore.getPublicKey(), (p) => unshieldedKeystore.signData(p),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
      console.log('✅ Registration submitted. Waiting for DUST to generate (2-5 min)...');
    }
    await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }

  state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const dustBal = state.dust.balance(new Date());
  console.log(`   DUST balance: ${dustBal.toLocaleString()}`);

  // k=11 circuits need significant DUST — wait if balance is low
  const MIN_DUST = 2_000_000_000_000_000n;
  if (dustBal < MIN_DUST) {
    console.log(`\n⏳ DUST balance too low for k=11 deployment. Need ~2,000,000,000,000,000.`);
    console.log(`   Waiting for more DUST to accumulate...`);
    await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(10000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) >= MIN_DUST),
      ),
    );
    console.log('✅ Sufficient DUST accumulated.');
  }

  // ── Build providers ───────────────────────────────────────────────
  const walletProvider = await createWalletAndMidnightProvider({
    wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore,
  });

  const accountId = walletProvider.getCoinPublicKey();
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'alphavault-private-state',
      accountId,
      privateStoragePasswordProvider: () => `${Buffer.from(accountId, 'hex').toString('base64')}!`,
    }),
    publicDataProvider: indexerPublicDataProvider(INDEXER, INDEXER_WS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // ── Deploy ────────────────────────────────────────────────────────
  console.log('\n🚀 Deploying AlphaVault contract...');
  console.log('   Generating ZK proofs — this takes 2-5 minutes for k=11 circuits.');
  console.log('   Do not kill the process.\n');

  // Progress indicator
  const spinner = setInterval(() => process.stdout.write('.'), 5000);

  let deployed;
  try {
    deployed = await deployContract(providers, {
      compiledContract,
      privateStateId: 'alphavaultState',
      initialPrivateState: {},
    });
  } finally {
    clearInterval(spinner);
    process.stdout.write('\n');
  }

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n✅ CONTRACT DEPLOYED!');
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Network: ${NETWORK_ID}`);

  const deployment = {
    contractAddress,
    network: NETWORK_ID,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync('deployment.json', JSON.stringify(deployment, null, 2));
  fs.writeFileSync('public/deployment.json', JSON.stringify(deployment, null, 2));
  console.log('\n💾 Saved to deployment.json and public/deployment.json');
  console.log('   The frontend will automatically use this contract.\n');

  await wallet.stop();
  process.exit(0);
}

deploy().catch((err) => {
  console.error('\n❌ DEPLOY FAILED:', err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
