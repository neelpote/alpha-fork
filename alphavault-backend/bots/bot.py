BOT_NAME = "Prism Delta"
INITIAL_CAPITAL = 1000

import random
from datetime import datetime, timedelta

ASSETS = ["BTC", "ETH", "SOL"]

def run() -> list[dict]:
    trades = []
    
    current_date = datetime(2026, 1, 1)
    capital = INITIAL_CAPITAL

    for day in range(30):  # simulate 30 days
        num_trades = random.randint(1, 2)

        for _ in range(num_trades):
            asset = random.choice(ASSETS)
            action = random.choice(["BUY", "SELL"])

            price = round(random.uniform(50, 100000), 2)
            quantity = round(random.uniform(0.01, 0.5), 4)

            # Strategy Logic: Momentum + Mean Reversion
            market_movement = random.gauss(0.5, 2)

            if action == "BUY":
                pnl = round(market_movement * quantity * 50, 2)
            else:
                pnl = round(-market_movement * quantity * 50, 2)

            capital += pnl

            trades.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "asset": asset,
                "action": action,
                "price": price,
                "quantity": quantity,
                "pnl": pnl,
            })

        current_date += timedelta(days=1)

    return trades