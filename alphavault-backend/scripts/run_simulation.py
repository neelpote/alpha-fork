from src.simulator import generate_trades
from src.portfolio import compute_equity_curve
from src.metrics import calculate_metrics
from src.exporter import export_data

def main():
    print("Generating trades...")
    trades_df = generate_trades()

    print("Computing equity curve...")
    equity_curve, daily_equity = compute_equity_curve(trades_df)

    print("Calculating metrics...")
    metrics = calculate_metrics(equity_curve, trades_df)

    print("Exporting data...")
    export_data(trades_df, equity_curve, metrics, daily_equity)

    print("\n✅ Simulation Complete")
    print(metrics)

if __name__ == "__main__":
    main()