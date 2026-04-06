# 🚀 AlphaVault Backend

## 🧠 Overview

AlphaVault is a **privacy-preserving trading vault** built on Midnight.
This backend simulates a trading strategy, computes performance metrics, and prepares **ZK-proof-friendly data** to enable verifiable returns without revealing trading logic.

---

## 🎯 What This Backend Does

* 📊 Simulates 90 days of trading activity across BTC, ETH, and SOL
* 📈 Tracks portfolio growth (equity curve)
* 📉 Calculates professional performance metrics
* 🔐 Generates ZK-friendly input for proof verification
* 🌐 Exposes APIs for frontend integration

---

## ⚙️ Tech Stack

* Python
* Pandas
* NumPy
* Flask

---

## 📁 Project Structure

```
alphavault-backend/
│
├── api/                # Flask API server
├── data/               # Generated outputs
├── scripts/            # Run scripts
├── src/                # Core logic
├── requirements.txt
└── README.md
```

---

## ▶️ How to Run

### 1. Install dependencies

```
pip install -r requirements.txt
```

### 2. Run simulation

```
python -m scripts.run_simulation
```

### 3. Start API server

```
python api/server.py
```

---

## 📊 API Endpoints

| Endpoint   | Description                                 |
| ---------- | ------------------------------------------- |
| `/metrics` | Returns APY, profit, drawdown, Sharpe ratio |
| `/equity`  | Returns daily portfolio value               |
| `/trades`  | Returns full trade history                  |

---

## 📂 Output Files

After running simulation:

* `data/trades.csv` → Trade history
* `data/metrics.json` → Performance metrics
* `data/equity_curve.json` → Portfolio progression
* `data/daily_equity.json` → Daily values (for charts)
* `data/zk_input.json` → ZK-proof input

---

## 🔐 ZK Integration

This backend prepares a simplified input for zero-knowledge proof generation:

```json
{
  "initial": 1000,
  "final": 2150,
  "profit": 1150,
  "trades": 87
}
```

### ✔️ Verifiable Condition:

```
final = initial + profit
```

This allows the system to prove profitability **without exposing trade-level data**.

---

## 🔗 Integration Guide

### 🎨 Frontend

Fetch data from:

* `http://localhost:5000/metrics`
* `http://localhost:5000/equity`
* `http://localhost:5000/trades`

Use:

* Equity → charts
* Metrics → dashboard cards
* Trades → table

---

### 🔐 ZK Module

Use:

```
data/zk_input.json
```

To generate proof for:

```
final = initial + profit
```

---

## 🧠 Strategy (Simulated)

The backend simulates a **Momentum + Mean Reversion Hybrid Strategy**, generating realistic trade behavior and portfolio fluctuations.

---

## 🎤 Demo Pitch

> AlphaVault enables trustless investment by proving trading performance using zero-knowledge proofs — without revealing the strategy.

---

## 🏆 Why This Matters

* ❌ No more fake trading results
* ✅ Verifiable performance
* 🔐 Strategy remains private
* ⚡ Built for Midnight

---

## 👨‍💻 Author

Backend Quant — AlphaVault Team

---

## 🚀 Status

✅ Backend Complete
🔄 Ready for Frontend & ZK Integration

---
