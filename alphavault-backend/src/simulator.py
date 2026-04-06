import pandas as pd
import random
from datetime import datetime, timedelta
from .config import DAYS, ASSETS

def generate_trades():
    trades = []
    current_date = datetime.now() - timedelta(days=DAYS)

    for _ in range(DAYS):
        num_trades = random.randint(1, 3)

        for _ in range(num_trades):
            asset = random.choice(ASSETS)
            action = random.choice(["BUY", "SELL"])

            price = round(random.uniform(20, 3000), 2)
            quantity = round(random.uniform(0.1, 2), 2)

            # Simulated smarter logic (AI-like behavior)
            price_change = random.gauss(0, 2)

            if action == "BUY":
                pnl = round(price_change * quantity * 10, 2)
            else:
                pnl = round(-price_change * quantity * 10, 2)

            trades.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "asset": asset,
                "action": action,
                "price": price,
                "quantity": quantity,
                "pnl": pnl
            })

        current_date += timedelta(days=1)

    return pd.DataFrame(trades)