# AlphaVault

A privacy-preserving DeFi vault on the [Midnight Network](https://midnight.network) that enables quantitative traders to manage investor capital while proving performance on-chain via zero-knowledge proofs. Investors see verified APY without ever seeing raw trade data or strategy logic.

**Live contract on Midnight Preprod:**
`52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e`

---

## 🎯 Core Features

### For Investors
- **ZK-Verified Performance** — APY verified on-chain via ZK-SNARKs without revealing trade data
- **Live Price Ticker** — Real-time BTC/ETH/SOL prices from CoinGecko (polled every 10s)
- **On-Chain Deposits/Withdrawals** — Secure vault operations via Midnight smart contract
- **Trade Data Verification** — Upload CSV to verify SHA-256 hash matches on-chain commitment
- **Comprehensive Analytics** — Equity curves, drawdown, monthly returns, rolling metrics, risk analysis
- **Portfolio Allocation** — Asset distribution and per-asset performance tracking
- **Wallet Integration** — Connect via Lace wallet (Midnight Preprod)

### For Quants
- **Bot Plugin System** — Upload any Python trading bot without touching core codebase
- **Sandbox Execution** — Run bots in isolated environment, generate trades + ZK inputs
- **Strategy Privacy** — Individual trades, positions, and logic never revealed on-chain
- **Performance Proof** — Submit ZK proof to verify APY math cryptographically
- **Live Paper Trading** — Built-in momentum + mean reversion bot with real CoinGecko prices
- **Flexible Interface** — Simple Python API: `BOT_NAME`, `INITIAL_CAPITAL`, `run()` function

### On-Chain (Midnight Compact)
- **Public Ledger State** — TVL, verified APY, investor balances, trade count, trade data commitment
- **Private Witnesses** — Net PnL, capital, trade period, trade count, trade hash (never disclosed)
- **ZK Circuits** — `initialize`, `deposit`, `withdraw`, `getBalance`, `updatePerformance`
- **Cryptographic Binding** — SHA-256 hash links private aggregates to actual trade data
- **Admin Identity Proof** — Admin key never on-chain, verified via ZK witness

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- Python 3.9+
- Docker Desktop
- Chrome with [Lace wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk)

### 1. Clone & Install

```bash
git clone https://github.com/neelpote/alpha-fork
cd alpha-fork
npm install
cp .env.example .env
```

### 2. Start Midnight Local Network (Docker)

```bash
docker compose -f midnight-local-network/compose.yml up -d
```

This starts three containers:
- **proof-server** (port 6300) — ZK-SNARK proof generation
- **node** — Midnight RPC node
- **indexer** — On-chain data indexer

> **Troubleshooting:** If you get `port is already allocated`:
> ```bash
> docker rm -f proof-server
> docker compose -f midnight-local-network/compose.yml up -d
> ```

### 3. Start Backend

```bash
cd alphavault-backend
pip install -r requirements.txt
python -m scripts.run_simulation        # generates data/ (first time only)
python -m flask --app api/server.py run --port 5000
```

### 4. Start Frontend

```bash
cd ..
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Browser (React + Vite :5173)                     │
│  • 9 Pages: Dashboard, BotSubmit, Analytics, Strategy, etc.    │
│  • 23 Components: Charts, Modals, Tables, Cards                │
│  • Wallet Context: Lace wallet integration                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Flask API (Python :5000)                           │
│  Static: /metrics, /equity, /trades, /allocation, etc.         │
│  Live:   /live-prices, /bot-status                             │
│  Bot:    /upload-bot, /run-bot, /verify-trades                 │
│  Chain:  /build-deposit, /build-withdraw, /submit-proof        │
└────────────────────────────┬────────────────────────────────────┘
                             │ Node.js scripts
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Midnight Preprod Network                                │
│  • Proof Server (Docker :6300) — ZK-SNARK generation           │
│  • Node RPC — Contract execution                               │
│  • Indexer — On-chain data queries                             │
│  • Smart Contract (Compact) — Vault logic + ZK circuits        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Frontend Features (React + Vite)

### Pages (9)
1. **DashboardPage** — Main investor dashboard with live ticker, bot status, ZK-verified APY, deposit/withdraw, equity curve, trades table, risk metrics, portfolio allocation, asset performance, drawdown, monthly returns, rolling metrics
2. **BotSubmitPage** — Upload Python bot files, run in sandbox, view results (trades, APY, win rate), submit ZK proof on-chain
3. **AnalyticsPage** — Historical performance charts, KPI cards, rolling metrics
4. **StrategyPage** — Strategy documentation and explanation
5. **LandingPage** — Marketing homepage with hero, features, workflow
6. **AboutPage** — Project information
7. **DocsPage** — API documentation and integration guide
8. **DeployPage** — Contract deployment instructions
9. **ConnectWallPage** — Lace wallet connection flow

### Components (23)
- **Charts**: EquityChart, DrawdownChart, MonthlyReturnsChart, RollingMetricsChart, BenchmarkChart, AssetPerformanceChart
- **Modals**: TransactionModal (deposit/withdraw), ZKProofModal (animated proof generation), TradeVerifyModal (CSV hash verification)
- **Dashboards**: RiskMetricsDashboard, PortfolioAllocation, EpochStatus (countdown to next verification)
- **Tables**: TradesTable (ID, asset, action, price, quantity, PnL)
- **Cards**: MetricCard, VaultStatus
- **UI**: Navbar, Footer, HeroSection, DemoSection (3D scene with particles), SceneBackground

### Live Features
- **Price Polling** — BTC/ETH/SOL from CoinGecko every 10 seconds
- **Bot Status** — Running state, iteration count, open positions, capital, trade count
- **Auto-Reconnect** — Wallet reconnects on page reload if previously connected
- **Transaction Tracking** — Real-time status updates for deposits/withdrawals
- **ZK Proof Animation** — Visual feedback during proof generation

---

## 🔌 API Endpoints (Flask Python)

### Static Data (from data/ folder)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Strategy performance (APY, profit, drawdown, Sharpe, win rate) |
| GET | `/equity` | Daily equity curve |
| GET | `/trades` | Trade history CSV |
| GET | `/allocation` | Portfolio allocation by asset |
| GET | `/asset-performance` | Per-asset PnL |
| GET | `/risk-metrics` | Win rate, profit factor, avg win/loss |
| GET | `/drawdown` | Drawdown curve |
| GET | `/monthly-returns` | Monthly return percentages |
| GET | `/rolling-metrics` | 7-day rolling Sharpe/volatility |
| GET | `/benchmark` | Benchmark comparison |

### Live Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/live-prices` | Real-time BTC/ETH/SOL from CoinGecko |
| GET | `/bot-status` | Bot running state, positions, capital, trades |
| GET | `/contract-state` | On-chain contract state from indexer |
| GET | `/investor-balance` | Investor vault balance |
| GET | `/trade-commitment` | On-chain trade data hash |

### Bot Plugin System
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-bot` | Upload .py bot file to bots/ folder |
| POST | `/run-bot` | Execute bot, generate trades.csv + zk_input.json |
| GET | `/bots` | List uploaded bot files |
| POST | `/verify-trades` | Verify CSV matches on-chain SHA-256 hash |

### On-Chain Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/build-deposit` | Run deposit.mjs, track balance locally |
| POST | `/build-withdraw` | Run withdraw.mjs |
| POST | `/submit-proof` | Run update-performance.mjs, submit ZK proof |

---

## 🤖 Bot Plugin System

Anyone can connect their own trading strategy to AlphaVault without touching the core codebase.

### Bot File Format

```python
BOT_NAME        = "My Strategy"
INITIAL_CAPITAL = 1000          # USD

def run() -> list[dict]:
    """
    Return list of trade dicts with required fields:
    - date: str (YYYY-MM-DD)
    - asset: str (BTC, ETH, SOL)
    - action: str (BUY or SELL)
    - price: float
    - quantity: float
    - pnl: float
    """
    return [
        {
            "date":     "2026-01-01",
            "asset":    "BTC",
            "action":   "SELL",
            "price":    95000.0,
            "quantity": 0.01,
            "pnl":      45.20,
        },
    ]
```

### Integration Flow

```
1. Write bot.py with required interface
2. Upload at /submit-bot page
3. Review results (trades, APY, win rate)
4. Admin submits ZK proof on-chain
```

### What Goes On-Chain vs Private

| On-Chain (Public) | Private (Never Revealed) |
|---|---|
| Verified APY (basis points) | Individual trade prices |
| Total trade count | Position sizes |
| SHA-256 hash of trade CSV | Strategy logic |
| Investor balances | Net PnL raw value |
| TVL | Trade timestamps |

### Built-In Trading Bot

**Live Paper Trading Bot** (`src/trading_bot.py`):
- Fetches real BTC/ETH/SOL prices from CoinGecko (free, no API key)
- **Strategy**: Momentum + Mean Reversion
  - BUY when price > 0.5% above 3-sample moving average
  - SELL when price < 0.5% below average
  - Stop loss: 3%, Take profit: 5%
- Polls prices every 30 seconds
- Records trades with real market prices
- Computes verified PnL and APY for ZK proof

---

## 🔐 Smart Contract (Midnight Compact)

### Public Ledger State (On-Chain)
```compact
export ledger totalValueLocked:    Uint<64>;
export ledger verifiedApy:         Uint<32>;  // basis points (1450 = 14.50%)
export ledger investorBalances:    Map<Bytes<32>, Uint<64>>;
export ledger quantAdmin:          Bytes<32>;
export ledger totalTrades:         Uint<32>;
export ledger tradeDataCommitment: Bytes<32>;  // SHA-256 of trade CSV
```

### Private Witnesses (ZK Proof Only)
```compact
witness callerAddress():        Bytes<32>;  // Admin identity
witness privateNetPnl():        Uint<64>;   // Total PnL * 1000
witness privateCapital():       Uint<64>;   // Initial capital * 1000
witness privateTradePeriod():   Uint<32>;   // Trading period (days)
witness privateTradeCount():    Uint<32>;   // Number of trades
witness privateTradeHash():     Bytes<32>;  // SHA-256 of trade data
```

### ZK Circuits (5)

1. **initialize(admin)** — Deploy contract, set admin
2. **deposit(investor, amount)** — Add funds, update TVL and balance
3. **withdraw(investor, amount)** — Remove funds, check sufficiency
4. **getBalance(investor)** — Query investor balance
5. **updatePerformance(newApy, numTrades)** — Core ZK circuit:
   - Verifies caller is admin (identity proof)
   - Reads private witnesses: netPnL, capital, period, tradeCount, tradeHash
   - Validates APY math: `|netPnL * 365 * 10000 - newApy * capital * period| <= capital * period`
   - Publishes verifiedApy, totalTrades, tradeDataCommitment on-chain
   - **Privacy guarantee**: Individual trades never revealed

### ZK Proof Keys
Located in `contracts/managed/alpha-vault/keys/`:
- `deposit.prover` / `deposit.verifier`
- `withdraw.prover` / `withdraw.verifier`
- `initialize.prover` / `initialize.verifier`
- `updatePerformance.prover` / `updatePerformance.verifier`
- `getBalance.prover` / `getBalance.verifier`

---

## 🔗 On-Chain Operations

All operations require Docker proof server running on port 6300.

### Deploy Contract (First Time)
```bash
MIDNIGHT_SEED="your 24 word seed" node scripts/deploy.mjs
```

### Submit ZK Performance Proof
```bash
MIDNIGHT_SEED="your 24 word seed" node scripts/update-performance.mjs
```

### Deposit
```bash
MIDNIGHT_SEED="your 24 word seed" AMOUNT=1000000 node scripts/deposit.mjs
```

### Withdraw
```bash
MIDNIGHT_SEED="your 24 word seed" AMOUNT=1000000 node scripts/withdraw.mjs
```

**Or use the dashboard UI** — Deposit/Withdraw/Generate ZK Proof buttons call these scripts via Flask API.

---

## 📁 Project Structure

```
contracts/
  alpha-vault.compact              # Compact ZK smart contract
  managed/alpha-vault/             # Compiled artifacts + ZK keys

alphavault-backend/
  api/
    server.py                      # Flask REST API (port 5000)
  bots/
    example_bot.py                 # Example bot plugin
    [uploaded bots]                # User-uploaded bot files
  src/
    trading_bot.py                 # Live paper trading (CoinGecko)
    plugin_runner.py               # Bot sandbox + ZK input generator
    simulator.py                   # Test data generator
    exporter.py                    # ZK input file generator
    metrics.py                     # Performance calculations
    portfolio.py                   # Equity curve computation
    config.py                      # Configuration
  data/
    trades.csv                     # Trade records
    metrics.json                   # Performance metrics
    equity_curve.json              # Equity array
    daily_equity.json              # Daily equity dict
    zk_input.json                  # ZK circuit witnesses
    investor_balances.json         # Investor balances
  scripts/
    run_simulation.py              # Generate test data

scripts/
  deploy.mjs                       # Deploy contract to Preprod
  update-performance.mjs           # Submit ZK APY proof
  deposit.mjs                      # On-chain deposit
  withdraw.mjs                     # On-chain withdraw

src/
  pages/
    DashboardPage.jsx              # Main investor dashboard
    BotSubmitPage.jsx              # Bot upload UI
    AnalyticsPage.jsx              # Historical charts
    StrategyPage.jsx               # Strategy docs
    LandingPage.jsx                # Marketing homepage
    AboutPage.jsx                  # Project info
    DocsPage.jsx                   # API docs
    DeployPage.jsx                 # Deployment guide
    ConnectWallPage.jsx            # Wallet connection
  components/
    [23 components]                # Charts, modals, tables, cards
  context/
    WalletContext.jsx              # Lace wallet integration
  contract/
    vaultService.js                # Deposit/withdraw via Flask
  utils/
    mockApi.js                     # Backend API calls + polling

midnight-local-network/
  compose.yml                      # Docker: proof-server + node + indexer
  src/
    fund.ts                        # Funding utilities
    fund-and-register-dust.ts      # Dust registration
```

---

## 🌐 Network Endpoints (Preprod)

| Service | URL |
|---|---|
| Node RPC | `https://rpc.preprod.midnight.network` |
| Indexer | `https://indexer.preprod.midnight.network/api/v3/graphql` |
| Proof Server (local) | `http://127.0.0.1:6300` |
| Explorer | `https://explorer.preprod.midnight.network` |
| Faucet | `https://faucet.preprod.midnight.network` |

---

## 🛠️ Technology Stack

### Frontend
- **React** 19.2.4 + **Vite** 8.0.1
- **Recharts** 3.8.1 (charts)
- **React Router** 7.13.2 (routing)
- **Tailwind CSS** 3.4.19 (styling)
- **Three.js** 0.183.2 + **React Three Fiber** 9.5.0 (3D scenes)
- **Lucide React** 1.7.0 (icons)
- **RxJS** 7.8.2 (reactive streams)
- **Midnight SDK** (wallet, contracts, indexer, proof provider)

### Backend
- **Python** 3.9+
- **Flask** (REST API)
- **Pandas** (data processing)
- **Requests** (HTTP, CoinGecko API)

### Smart Contracts
- **Compact** language (Midnight)
- **Midnight Node SDK** (JavaScript/TypeScript)
- **ZK-SNARK** proofs (proof-server Docker)

### Infrastructure
- **Docker** (proof-server, node, indexer)
- **Midnight Preprod Network**
- **CoinGecko API** (live prices)
- **Midnight Indexer** (on-chain data)

---

## 📈 Data Flow

### 1. Investor Deposits
```
Frontend → /build-deposit → Backend runs deposit.mjs → Proof server generates ZK proof
→ Midnight contract updates balance → Indexer reflects new TVL
```

### 2. Bot Runs
```
Backend executes bot plugin → Generates trades.csv + zk_input.json → Computes APY
→ SHA-256 hash of trades → Ready for ZK proof submission
```

### 3. Submit Proof
```
Frontend → /submit-proof → Backend runs update-performance.mjs → Proof server generates ZK-SNARK
→ Contract verifies APY math → Publishes verifiedApy + tradeDataCommitment on-chain
```

### 4. Investor Verifies
```
Frontend displays ZK-verified APY → Investor uploads trades.csv → SHA-256 hash computed
→ Compared with on-chain tradeDataCommitment → Match confirms data integrity
```

### 5. Live Polling
```
Frontend polls /live-prices + /bot-status every 10s → Updates ticker and bot status
→ Real-time dashboard without page refresh
```

---

## 🔒 Privacy Model

### What's Public (On-Chain)
✅ Verified APY (basis points)  
✅ Total trade count  
✅ SHA-256 hash of trade CSV  
✅ Investor balances  
✅ Total value locked  

### What's Private (Never Revealed)
🔒 Individual trade prices  
🔒 Position sizes  
🔒 Strategy logic  
🔒 Net PnL raw value  
🔒 Trade timestamps  
🔒 Asset allocation details  

**Cryptographic Guarantee**: ZK-SNARK proof binds private aggregates to on-chain hash without revealing raw data.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run ZK math tests
npm run test:zk
```

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

## 📧 Contact

For questions or support, open an issue on GitHub.
