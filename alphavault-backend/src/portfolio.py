from .config import INITIAL_CAPITAL

def compute_equity_curve(trades_df):
    equity = INITIAL_CAPITAL
    equity_curve = []
    daily_equity = {}

    for _, row in trades_df.iterrows():
        equity += row["pnl"]
        equity = round(equity, 2)

        equity_curve.append(equity)
        daily_equity[row["date"]] = equity

    return equity_curve, daily_equity