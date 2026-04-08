"""
AlphaVault Example Bot
======================
Copy this file, rename it, implement your own strategy in run().

Required:
  BOT_NAME        - display name shown on the vault UI
  INITIAL_CAPITAL - starting capital in USD
  run()           - returns a list of trade dicts

Each trade dict must have these fields:
  date       (str)   "YYYY-MM-DD"
  asset      (str)   e.g. "BTC", "ETH", "SOL"
  action     (str)   "BUY" or "SELL"
  price      (float) execution price in USD
  quantity   (float) amount traded
  pnl        (float) profit/loss for this trade in USD
"""

from datetime import datetime, timedelta
import random

BOT_NAME        = "Example Mean Reversion Bot"
INITIAL_CAPITAL = 1000


def run() -> list[dict]:
    """
    Your strategy logic goes here.
    Return a list of completed trades.
    """
    trades = []
    start  = datetime.now() - timedelta(days=90)

    for day in range(90):
        date = (start + timedelta(days=day)).strftime("%Y-%m-%d")
        # Example: random trades — replace with your real strategy
        if random.random() > 0.6:
            asset    = random.choice(["BTC", "ETH", "SOL"])
            price    = random.uniform(100, 50000)
            quantity = round(random.uniform(0.01, 0.5), 4)
            pnl      = round(random.gauss(0.5, 5), 4)   # slight positive bias
            trades.append({
                "date":     date,
                "asset":    asset,
                "action":   "SELL",
                "price":    round(price, 2),
                "quantity": quantity,
                "pnl":      pnl,
            })

    return trades
