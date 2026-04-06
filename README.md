# AlphaVault

A privacy-preserving DeFi vault on the [Midnight Network](https://midnight.network). The AI quant's trading performance is verified on-chain using zero-knowledge proofs — investors see the verified APY without ever seeing the raw trade data.

**Live contract on Midnight Preprod:**
`52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e`

---

## Quick Start (for friends)

### Prerequisites
- Node.js v22+
- Python 3.9+
- Chrome browser with [Lace wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) installed

### 1. Clone & install

```bash
git clone https://github.com/neelpote/AlphaVault-fork
cd AlphaVault-fork
npm install
cp .env.example .env
```

### 2. Start the backend

```bash
cd alphavault-backend
pip3 install -r requirements.txt
python3 -m scripts.run_simulation   # generates data/
python3 -m flask --app api/server.py run --port 5000
```

Leave this running. Open a new terminal for the next step.

### 3. Start the frontend

```bash
cd ..   # back to project root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Connect Lace wallet

1. Install [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) in Chrome
2. Open Lace → Settings → Beta features → enable Midnight
3. Set network to **Preprod**
4. Get test DUST from [faucet.preprod.midnight.network](https://faucet.preprod.midnight.network)
5. Click "Connect Wallet" in the app

---

## Deploy your own contract (optional)

Requires Docker for the ZK proof server.

```bash
# Start proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v

# Install Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
compact update

# Compile contract
compact compile -- contracts/alpha-vault.compact contracts/managed/alpha-vault

# Deploy (replace with your seed)
MIDNIGHT_SEED="your 24 word seed phrase" node scripts/deploy.mjs

# Submit ZK performance proof
MIDNIGHT_SEED="your 24 word seed phrase" node scripts/update-performance.mjs
```

---

## Project Structure

```
contracts/
  alpha-vault.compact          # Compact smart contract (ZK circuits)
  managed/alpha-vault/         # Compiled artifacts (after compact compile)

alphavault-backend/
  api/server.py                # Flask REST API (port 5000)
  src/                         # Simulation logic
  data/                        # Generated trade data + ZK inputs

scripts/
  deploy.mjs                   # Deploy contract to Midnight Preprod
  deposit.mjs                  # Make a real on-chain deposit
  update-performance.mjs       # Submit ZK APY proof on-chain

src/
  context/WalletContext.jsx    # Lace wallet integration
  pages/                       # React pages
  components/                  # UI components
  utils/mockApi.js             # Backend API client
```

---

## How the ZK Proof Works

The `updatePerformance` circuit on Midnight verifies:

**Private (never on-chain):**
- Individual trade entry/exit prices
- Position sizes
- Net PnL raw value
- Initial capital

**Public (written to ledger):**
- Verified APY in basis points
- Trade data commitment hash (SHA-256 of trade CSV)
- Total trades count

The circuit asserts: `netPnL × 365 × 10000 ≈ newApy × capital × period`

If the quant inflates the APY, the math fails → proof rejected → transaction reverts.

---

## Network Endpoints (Preprod)

| Service | URL |
|---|---|
| Node RPC | `https://rpc.preprod.midnight.network` |
| Indexer | `https://indexer.preprod.midnight.network/api/v3/graphql` |
| Proof Server | `https://proof-server.preprod.midnight.network` |
| Faucet | `https://faucet.preprod.midnight.network` |
| Explorer | `https://explorer.preprod.midnight.network` |
