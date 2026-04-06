from .config import INITIAL_CAPITAL, DAYS

def calculate_metrics(equity_curve, trades_df):
    final_value = equity_curve[-1]
    total_profit = final_value - INITIAL_CAPITAL

    # APY calculation
    apy = ((final_value / INITIAL_CAPITAL) ** (365 / DAYS)) - 1

    # Max Drawdown
    peak = equity_curve[0]
    max_drawdown = 0

    for value in equity_curve:
        if value > peak:
            peak = value

        drawdown = (peak - value) / peak
        if drawdown > max_drawdown:
            max_drawdown = drawdown

    # Win Rate
    wins = len(trades_df[trades_df["pnl"] > 0])
    total = len(trades_df)
    win_rate = wins / total if total > 0 else 0

    return {
        "strategy": "Momentum + Mean Reversion Hybrid",
        "initial_capital": INITIAL_CAPITAL,
        "final_value": round(final_value, 2),
        "total_profit": round(total_profit, 2),
        "apy_percent": round(apy * 100, 2),
        "max_drawdown_percent": round(max_drawdown * 100, 2),
        "win_rate_percent": round(win_rate * 100, 2),
        "sharpe_ratio": round((total_profit / INITIAL_CAPITAL) / 0.1, 2),
        "total_trades": total
    }