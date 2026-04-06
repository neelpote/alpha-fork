from flask import Flask, jsonify
import json
import pandas as pd

app = Flask(__name__)


@app.route("/")
def home():
    return {
        "message": "AlphaVault Backend API Running 🚀",
        "endpoints": [
            "/metrics",
            "/equity",
            "/trades"
        ]
    }
# -----------------------------
# ROUTES
# -----------------------------

@app.route("/metrics")
def get_metrics():
    with open("data/metrics.json") as f:
        return jsonify(json.load(f))


@app.route("/equity")
def get_equity():
    with open("data/daily_equity.json") as f:
        return jsonify(json.load(f))


@app.route("/trades")
def get_trades():
    df = pd.read_csv("data/trades.csv")
    return jsonify(df.to_dict(orient="records"))


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)