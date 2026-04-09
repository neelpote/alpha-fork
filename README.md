# AlphaVault

A privacy-preserving DeFi vault on the [Midnight Network](https://midnight.network). Trading performance is verified on-chain using zero-knowledge proofs — investors see the verified APY without ever seeing the raw trade data or strategy.

**Live contract on Midnight Preprod:**
`52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e`

---

## Quick Start

### Prerequisites
- Node.js v20+
- Python 3.9+
- Chrome with [Lace wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk)

### 1. Clone & install

```bash
git clone https://github.com/neelpote/alpha-fork
cd alpha-fork
npm install
cp .env.example .env
```

### 2. Start the backend

```bash
cd alphavault-backend
pip install -r requirements.txt
python -m scripts.run_simulation        # generates data/
python -m flask --app api/server.py run --port 5000
```

### 3. Start the frontend

```bash
cd ..
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## On-Chain Deployment (requires teammate's setup)

Requires Docker + Compact compiler installed.

```bash
# Start proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v

# Compile contract
compact compile -- contracts/alpha-vault.compact contracts/managed/alpha-vault

# Deploy
MIDNIGHT_SEED="your 24 word seed phrase" node scripts/deploy.mjs

# Submit ZK performance proof
MIDNIGHT_SEED="your 24 word seed phrase" node scripts/update-performance.mjs
```

---

## Updates Made (April 8, 2026)

### Bug Fixes
- Installed missing `flask-cors` dependency, added it to `requirements.txt`
- Installed missing `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` npm package
- Fixed Vite crashing on missing compiled contract artifacts — added `contract-stub.js` and a Vite alias so the app loads cleanly without compiled contracts
- Replaced broken on-chain deposit/withdraw flow (which required compiled artifacts) with a graceful mock fallback
- Fixed `DashboardPage` and `useVaultContract` to not crash when contract is not compiled

### New Feature — Bot Plugin System
Anyone can now connect their own trading bot to AlphaVault without touching the core codebase.

**New files:**
- `alphavault-backend/src/plugin_runner.py` — loads, validates, and runs third-party bot files
- `alphavault-backend/bots/example_bot.py` — template bot for third parties
- `alphavault-backend/bots/` — folder where uploaded bots are saved
- `src/pages/BotSubmitPage.jsx` — drag & drop UI for uploading bots
- `src/contract/contract-stub.js` — stub for uncompiled contract artifacts

**New API endpoints (Flask):**
- `POST /upload-bot` — accepts a `.py` bot file
- `POST /run-bot` — runs an uploaded bot, generates `trades.csv` + `zk_input.json`
- `GET /bots` — lists all uploaded bots

**Frontend:**
- Added "Submit Bot" to the navbar → `/submit-bot`
- Drag & drop upload zone with live result preview (trades, APY, win rate, trade hash)

---

## Bot Plugin Guide (for teammates & integrators)

### How it works

A third-party quant uploads a single `.py` file. The system runs it, computes metrics, generates the ZK input, and makes it ready for on-chain proof submission. The strategy stays private — only the SHA-256 hash of the trade data goes on-chain.

### Bot file format

Your bot file must define three things:

```python
BOT_NAME        = "My Strategy Name"   # shown on the UI
INITIAL_CAPITAL = 1000                 # starting capital in USD

def run() -> list[dict]:
    # your strategy logic here
    return [
        {
            "date":     "2026-01-01",   # YYYY-MM-DD
            "asset":    "BTC",          # BTC, ETH, SOL, or any ticker
            "action":   "SELL",         # BUY or SELL
            "price":    95000.0,        # execution price in USD
            "quantity": 0.01,           # amount traded
            "pnl":      45.20,          # profit/loss for this trade in USD
        },
        # ... more trades
    ]
```

All six fields (`date`, `asset`, `action`, `price`, `quantity`, `pnl`) are required per trade.

### Integration flow

```
Write bot.py  →  Upload at /submit-bot  →  Review results  →  Admin runs update-performance.mjs
```

1. Write your bot following the format above
2. Go to `/submit-bot` in the UI and drag & drop your `.py` file
3. The system runs your bot and shows: total trades, APY, profit, win rate, trade data hash
4. The vault admin then runs:
   ```bash
   node scripts/update-performance.mjs
   ```
   This submits a ZK proof on-chain — the verified APY is updated, your trade data stays private

### What goes on-chain vs what stays private

| On-chain (public) | Private (never revealed) |
|---|---|
| Verified APY (basis points) | Individual trade prices |
| Total trade count | Position sizes |
| SHA-256 hash of trade CSV | Strategy logic |
| Investor balances | Net PnL raw value |

### Running your bot locally (optional)

You can test your bot before uploading:

```bash
cd alphavault-backend
python -c "
from src.plugin_runner import run_bot_plugin
result = run_bot_plugin('bots/your_bot.py')
print(result)
"
```

### For the teammate doing on-chain integration

Once the bot is uploaded and run via the UI, the files are ready:

- `alphavault-backend/data/zk_input.json` — ZK witnesses for the proof
- `alphavault-backend/data/trades.csv` — full trade history
- `alphavault-backend/data/metrics.json` — performance summary

Run this from the project root (requires compiled contract + Docker proof server):

```bash
MIDNIGHT_SEED="your 24 word seed phrase" node scripts/update-performance.mjs
```

The script reads `zk_input.json`, generates a ZK proof that the APY math is correct, and submits it to the Midnight Preprod contract. The frontend will then show the on-chain verified APY.

---

## Project Structure

```
contracts/
  alpha-vault.compact              # Compact ZK smart contract
  managed/alpha-vault/             # Compiled artifacts (after compact compile)

alphavault-backend/
  api/server.py                    # Flask REST API (port 5000)
  bots/                            # Uploaded third-party bot files
    example_bot.py                 # Template for bot authors
  src/
    plugin_runner.py               # Bot plugin loader & runner
    simulator.py                   # Built-in simulation
    trading_bot.py                 # Live paper trading bot
    exporter.py                    # Generates ZK input files
  data/                            # Generated trade data + ZK inputs

scripts/
  deploy.mjs                       # Deploy contract to Midnight Preprod
  update-performance.mjs           # Submit ZK APY proof on-chain

src/
  pages/
    BotSubmitPage.jsx              # Bot upload UI
    DashboardPage.jsx              # Investor dashboard
  contract/
    alpha-vault-api.js             # Contract interface (mock + real)
    contract-stub.js               # Stub when contract not compiled
  hooks/useVaultContract.js        # Wallet + contract hook
  utils/mockApi.js                 # Backend API client
```

---

## Network Endpoints (Preprod)

| Service | URL |
|---|---|
| Node RPC | `https://rpc.preprod.midnight.network` |
| Indexer | `https://indexer.preprod.midnight.network/api/v3/graphql` |
| Proof Server | `https://proof-server.preprod.midnight.network` |
| Faucet | `https://faucet.preprod.midnight.network` |
| Explorer | `https://explorer.preprod.midnight.network` |
