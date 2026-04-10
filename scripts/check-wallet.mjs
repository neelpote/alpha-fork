import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

globalThis.WebSocket = WebSocket;

const mnemonic = process.env.MIDNIGHT_SEED;
if (!mnemonic) { console.error('Set MIDNIGHT_SEED'); process.exit(1); }

const seedBuf = mnemonicToSeedSync(mnemonic.trim());
const seedHex = seedBuf.slice(0, 32).toString('hex');

setNetworkId('preprod');

const hd = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
const result = hd.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
const keys = result.keys;

const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preprod');

console.log('\n📍 Backend wallet address:');
const addr = unshieldedKeystore.getBech32Address();
const addrStr = typeof addr === 'string' ? addr : (addr?.toString?.() ?? JSON.stringify(addr));
console.log('  ', addrStr);
console.log('\nFund this address at: https://faucet.preprod.midnight.network\n');

const INDEXER = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const NODE = 'https://rpc.preprod.midnight.network';
const PROOF_SERVER = 'http://127.0.0.1:6300';

const wallet = await WalletFacade.init({
  configuration: {
    networkId: 'preprod',
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    relayURL: new URL(NODE.replace(/^https/, 'wss')),
    provingServerUrl: new URL(PROOF_SERVER),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  },
  shielded: cfg => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
  unshielded: cfg => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
  dust: cfg => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
});

await wallet.start(shieldedSecretKeys, dustSecretKey);
console.log('Syncing...');
const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5000), Rx.filter(s => s.isSynced)));

const nightBal = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
const dustBal = state.dust.balance(new Date());

console.log(`  tNIGHT balance : ${nightBal.toLocaleString()}`);
console.log(`  DUST balance   : ${dustBal.toLocaleString()}`);

if (dustBal === 0n) {
  console.log('\n⚠️  No DUST — fund the address above with tNIGHT from the faucet');
  console.log('   Then wait 5-10 minutes for DUST to accumulate\n');
} else {
  console.log('\n✅ Wallet has DUST — ready to transact\n');
}

await wallet.stop();
process.exit(0);
