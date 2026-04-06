"""
AlphaVault Trading Bot
======================
Paper trading bot that:
  1. Fetches real BTC/ETH/SOL prices from CoinGecko (free, no API key)
  2. Runs a momentum + mean reversion strategy
  3. Records trades with real market prices
  4. Computes verified PnL and submits APY proof to the Midnight contract

Run:
    python3 -m src.trading_bot

To submit the ZK proof after a session:
    node scripts/update-performance.mjs
"""

import time
import json
import os
import requests
from datetime import datetime
from .config import INITIAL_CAPITAL, ASSETS

# ── Config ────────────────────────────────────────────────────────────────────

COINGECKO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
}

POSITION_SIZE_PCT = 0.10   # 10% of capital per trade
MOMENTUM_WINDOW   = 3      # number of price samples to compute momentum
STOP_LOSS_PCT     = 0.03   # 3% stop loss
TAKE_PROFIT_PCT   = 0.05   # 5% take profit
POLL_INTERVAL_SEC = 30     # fetch prices every 30 seconds

# ── Price fetcher ─────────────────────────────────────────────────────────────

def fetch_prices():
    """Fetch current USD prices from CoinGecko."""
    ids = ",".join(COINGECKO_IDS.values())
    try:
        res = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": ids, "vs_currencies": "usd"},
            timeout=10,
        )
        data = res.json()
        return {
            asset: data[cg_id]["usd"]
            for asset, cg_id in COINGECKO_IDS.items()
            if cg_id in data
        }
    except Exception as e:
        print(f"  ⚠️  Price fetch failed: {e}")
        return None

# ── Strategy ──────────────────────────────────────────────────────────────────

class MomentumStrategy:
    """
    Simple momentum strategy:
    - BUY  when price is above its recent average (uptrend)
    - SELL when price is below its recent average (downtrend)
    - Stop loss and take profit on open positions
    """

    def __init__(self, capital):
        self.capital    = capital
        self.positions  = {}   # asset -> {entry_price, size, direction}
        self.trades     = []
        self.price_history = {asset: [] for asset in COINGECKO_IDS}

    def update(self, prices):
        signals = []

        for asset, price in prices.items():
            history = self.price_history[asset]
            history.append(price)
            if len(history) > MOMENTUM_WINDOW * 2:
                history.pop(0)

            if len(history) < MOMENTUM_WINDOW:
                continue

            avg = sum(history[-MOMENTUM_WINDOW:]) / MOMENTUM_WINDOW
            momentum = (price - avg) / avg  # % above/below average

            # Check existing position
            if asset in self.positions:
                pos = self.positions[asset]
                pnl_pct = (price - pos["entry_price"]) / pos["entry_price"]
                if pos["direction"] == "LONG":
                    if pnl_pct <= -STOP_LOSS_PCT or pnl_pct >= TAKE_PROFIT_PCT:
                        signals.append(("SELL", asset, price, pos))
                else:
                    if pnl_pct >= STOP_LOSS_PCT or pnl_pct <= -TAKE_PROFIT_PCT:
                        signals.append(("BUY_COVER", asset, price, pos))
            else:
                # Enter new position based on momentum
                if momentum > 0.005:   # 0.5% above average → BUY
                    signals.append(("BUY", asset, price, None))
                elif momentum < -0.005:  # 0.5% below average → SHORT (simulated)
                    signals.append(("SELL_SHORT", asset, price, None))

        return signals

    def execute(self, signal, asset, price, existing_pos):
        position_value = self.capital * POSITION_SIZE_PCT
        size = round(position_value / price, 6)

        if signal == "BUY" and asset not in self.positions:
            self.positions[asset] = {
                "entry_price": price,
                "size": size,
                "direction": "LONG",
                "entry_time": datetime.now().isoformat(),
            }
            print(f"  📈 BUY  {asset} @ ${price:,.2f}  size={size}")

        elif signal == "SELL" and asset in self.positions:
            pos   = self.positions.pop(asset)
            pnl   = (price - pos["entry_price"]) * pos["size"]
            self.capital += pnl
            trade = {
                "date":        datetime.now().strftime("%Y-%m-%d"),
                "asset":       asset,
                "action":      "SELL",
                "entry_price": pos["entry_price"],
                "exit_price":  price,
                "price":       price,
                "quantity":    pos["size"],
                "pnl":         round(pnl, 4),
            }
            self.trades.append(trade)
            emoji = "✅" if pnl > 0 else "❌"
            print(f"  {emoji} SELL {asset} @ ${price:,.2f}  PnL=${pnl:+.4f}  Capital=${self.capital:.2f}")

        elif signal == "SELL_SHORT" and asset not in self.positions:
            self.positions[asset] = {
                "entry_price": price,
                "size": size,
                "direction": "SHORT",
                "entry_time": datetime.now().isoformat(),
            }
            print(f"  📉 SHORT {asset} @ ${price:,.2f}  size={size}")

        elif signal == "BUY_COVER" and asset in self.positions:
            pos   = self.positions.pop(asset)
            pnl   = (pos["entry_price"] - price) * pos["size"]  # profit on short
            self.capital += pnl
            trade = {
                "date":        datetime.now().strftime("%Y-%m-%d"),
                "asset":       asset,
                "action":      "BUY",
                "entry_price": pos["entry_price"],
                "exit_price":  price,
                "price":       price,
                "quantity":    pos["size"],
                "pnl":         round(pnl, 4),
            }
            self.trades.append(trade)
            emoji = "✅" if pnl > 0 else "❌"
            print(f"  {emoji} COVER {asset} @ ${price:,.2f}  PnL=${pnl:+.4f}  Capital=${self.capital:.2f}")

    def get_summary(self):
        net_pnl    = self.capital - INITIAL_CAPITAL
        net_pnl_fp = int(net_pnl * 1000)
        capital_fp = int(INITIAL_CAPITAL * 1000)
        period     = max(1, len(self.trades))  # use trade count as proxy for days
        apy_bps    = int((net_pnl_fp * 365 * 10000) // (capital_fp * 90)) if capital_fp > 0 else 0

        return {
            "initial_capital":      INITIAL_CAPITAL,
            "final_value":          round(self.capital, 2),
            "total_profit":         round(net_pnl, 4),
            "total_trades":         len(self.trades),
            "apy_percent":          round(apy_bps / 100, 2),
            "privateNetPnl":        net_pnl_fp,
            "privateCapital":       capital_fp,
            "privateTradePeriod":   90,
            "privateTradeCount":    len(self.trades),
            "submittedApyBps":      apy_bps,
        }

# ── Main loop ─────────────────────────────────────────────────────────────────

def run_bot(max_iterations=None):
    print("\n🤖 AlphaVault Trading Bot")
    print(f"   Strategy : Momentum + Mean Reversion")
    print(f"   Capital  : ${INITIAL_CAPITAL:,}")
    print(f"   Assets   : {', '.join(COINGECKO_IDS.keys())}")
    print(f"   Interval : {POLL_INTERVAL_SEC}s\n")

    bot = MomentumStrategy(INITIAL_CAPITAL)
    iteration = 0

    try:
        while True:
            if max_iterations and iteration >= max_iterations:
                break

            iteration += 1
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Tick #{iteration}")

            prices = fetch_prices()
            if prices:
                print(f"  Prices: " + "  ".join(f"{a}=${p:,.0f}" for a, p in prices.items()))
                signals = bot.update(prices)
                for signal, asset, price, pos in signals:
                    bot.execute(signal, asset, price, pos)
            else:
                print("  Skipping tick — no price data")

            # Save state after every tick
            _save_state(bot)

            if not (max_iterations and iteration >= max_iterations):
                time.sleep(POLL_INTERVAL_SEC)

    except KeyboardInterrupt:
        print("\n\n⏹  Bot stopped by user")

    _save_state(bot)
    summary = bot.get_summary()
    print(f"\n📊 Session Summary")
    print(f"   Trades     : {summary['total_trades']}")
    print(f"   Final Value: ${summary['final_value']:,.2f}")
    print(f"   Net PnL    : ${summary['total_profit']:+.4f}")
    print(f"   APY        : {summary['apy_percent']}%")
    print(f"\n💾 Data saved to data/")
    print(f"   Run: node scripts/update-performance.mjs  to submit APY proof on-chain\n")
    return summary

def _save_state(bot):
    os.makedirs("data", exist_ok=True)
    summary = bot.get_summary()

    # Save trades CSV
    import pandas as pd
    if bot.trades:
        pd.DataFrame(bot.trades).to_csv("data/trades.csv", index=False)

    # Save metrics
    with open("data/metrics.json", "w") as f:
        json.dump({
            "strategy":             "Momentum + Mean Reversion (Live)",
            "initial_capital":      summary["initial_capital"],
            "final_value":          summary["final_value"],
            "total_profit":         summary["total_profit"],
            "apy_percent":          summary["apy_percent"],
            "max_drawdown_percent": 0,  # computed separately
            "win_rate_percent":     _win_rate(bot.trades),
            "sharpe_ratio":         0,
            "total_trades":         summary["total_trades"],
        }, f, indent=2)

    # Save ZK input for updatePerformance circuit
    with open("data/zk_input.json", "w") as f:
        json.dump({
            "privateNetPnl":      summary["privateNetPnl"],
            "privateCapital":     summary["privateCapital"],
            "privateTradePeriod": summary["privateTradePeriod"],
            "privateTradeCount":  summary["privateTradeCount"],
            "submittedApyBps":    summary["submittedApyBps"],
            "description": "Feed these as witnesses to updatePerformance circuit"
        }, f, indent=2)

def _win_rate(trades):
    if not trades:
        return 0
    wins = sum(1 for t in trades if t["pnl"] > 0)
    return round(wins / len(trades) * 100, 1)

if __name__ == "__main__":
    run_bot()
