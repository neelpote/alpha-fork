import json
import os
import hashlib
from .config import DAYS

def export_data(trades_df, equity_curve, metrics, daily_equity):
    os.makedirs("data", exist_ok=True)

    trades_df.to_csv("data/trades.csv", index=False)

    with open("data/equity_curve.json", "w") as f:
        json.dump(equity_curve, f, indent=4)

    with open("data/metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)

    with open("data/daily_equity.json", "w") as f:
        json.dump(daily_equity, f, indent=4)    
    # Compute SHA-256 hash of the trade data — this is the tradeDataCommitment
    # that goes on-chain. Investors can verify this hash against the raw CSV
    # if the quant ever chooses to disclose the trade data.
    trade_csv_bytes = trades_df.to_csv(index=False).encode('utf-8')
    trade_hash_hex  = hashlib.sha256(trade_csv_bytes).hexdigest()

    # ZK-friendly input file — feeds the updatePerformance circuit witnesses
    net_pnl_fixed = int(metrics["total_profit"] * 1000)
    capital_fixed = int(metrics["initial_capital"] * 1000)
    period_days   = DAYS
    apy_bps       = int((net_pnl_fixed * 365 * 10000) // (capital_fixed * period_days)) if capital_fixed > 0 else 0

    zk_input = {
        "privateNetPnl":      net_pnl_fixed,
        "privateCapital":     capital_fixed,
        "privateTradePeriod": period_days,
        "privateTradeCount":  metrics["total_trades"],
        "submittedApyBps":    apy_bps,
        "tradeDataHash":      trade_hash_hex,
        "description": "Feed privateNetPnl, privateCapital, privateTradePeriod, privateTradeCount, tradeDataHash as witnesses to updatePerformance circuit"
    }

    with open("data/zk_input.json", "w") as f:
        json.dump(zk_input, f, indent=4)        