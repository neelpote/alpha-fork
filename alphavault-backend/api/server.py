from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import pandas as pd
import os
import sys

# Allow imports from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.plugin_runner import run_bot_plugin

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

BOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "bots")
os.makedirs(BOTS_DIR, exist_ok=True)

def load_json(filename):
    path = os.path.join("data", filename)
    with open(path) as f:
        return json.load(f)

def load_csv(filename):
    return pd.read_csv(os.path.join("data", filename))

@app.route("/")
def home():
    return jsonify({
        "message": "AlphaVault Backend API Running 🚀",
        "endpoints": ["/metrics", "/equity", "/trades", "/allocation",
                      "/asset-performance", "/risk-metrics", "/drawdown",
                      "/monthly-returns", "/rolling-metrics", "/benchmark"]
    })

@app.route("/metrics")
def get_metrics():
    return jsonify(load_json("metrics.json"))

@app.route("/equity")
def get_equity():
    data = load_json("daily_equity.json")
    # Convert dict {date: value} to sorted array [{date, value}]
    result = sorted([{"date": k, "value": v} for k, v in data.items()],
                    key=lambda x: x["date"])
    return jsonify(result)

@app.route("/trades")
def get_trades():
    df = load_csv("trades.csv")
    records = df.to_dict(orient="records")
    for i, r in enumerate(records):
        r["id"] = i + 1
    return jsonify(records)

@app.route("/allocation")
def get_allocation():
    try:
        df = load_csv("trades.csv")
        alloc = df.groupby("asset")["pnl"].sum().abs()
        total = alloc.sum()
        result = [{"name": k, "value": round(v / total * 100, 1)}
                  for k, v in alloc.items()]
        return jsonify(result)
    except Exception:
        return jsonify([])

@app.route("/asset-performance")
def get_asset_performance():
    try:
        df = load_csv("trades.csv")
        perf = df.groupby("asset")["pnl"].sum().round(2)
        return jsonify([{"asset": k, "pnl": v} for k, v in perf.items()])
    except Exception:
        return jsonify([])

@app.route("/risk-metrics")
def get_risk_metrics():
    try:
        df = load_csv("trades.csv")
        wins   = df[df["pnl"] > 0]
        losses = df[df["pnl"] <= 0]
        win_rate     = round(len(wins) / len(df) * 100, 1) if len(df) else 0
        avg_win      = round(wins["pnl"].mean(), 2) if len(wins) else 0
        avg_loss     = round(abs(losses["pnl"].mean()), 2) if len(losses) else 0
        profit_factor = round(wins["pnl"].sum() / abs(losses["pnl"].sum()), 2) \
                        if losses["pnl"].sum() != 0 else 0
        return jsonify({
            "winRate": win_rate,
            "wins": len(wins),
            "losses": len(losses),
            "profitFactor": profit_factor,
            "avgWin": avg_win,
            "avgLoss": avg_loss,
        })
    except Exception:
        return jsonify({})

@app.route("/drawdown")
def get_drawdown():
    try:
        equity = load_json("equity_curve.json")
        peak = equity[0]
        result = []
        for i, v in enumerate(equity):
            if v > peak:
                peak = v
            dd = round((peak - v) / peak * 100, 2) if peak else 0
            result.append({"index": i, "dd": -dd})
        # Sample every 10 points to keep response small
        return jsonify(result[::10])
    except Exception:
        return jsonify([])

@app.route("/monthly-returns")
def get_monthly_returns():
    try:
        data = load_json("daily_equity.json")
        df = pd.DataFrame([{"date": k, "value": v} for k, v in data.items()])
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index()
        monthly = df["value"].resample("ME").last().pct_change().dropna() * 100
        months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"]
        result = [{"month": months[d.month - 1], "pct": round(v, 2)}
                  for d, v in monthly.items()]
        return jsonify(result)
    except Exception:
        return jsonify([])

@app.route("/rolling-metrics")
def get_rolling_metrics():
    # Derived from equity curve — simplified
    try:
        data = load_json("daily_equity.json")
        df = pd.DataFrame([{"date": k, "value": v} for k, v in data.items()])
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index()
        df["ret"] = df["value"].pct_change()
        df["vol"] = df["ret"].rolling(7).std() * 100
        df["sharpe"] = (df["ret"].rolling(7).mean() / df["ret"].rolling(7).std()).round(2)
        df = df.dropna().reset_index()
        result = [{"date": str(r["date"])[:10],
                   "sharpe": round(r["sharpe"], 2),
                   "volatility": round(r["vol"], 2)}
                  for _, r in df.iterrows()]
        return jsonify(result[::3])
    except Exception:
        return jsonify([])

@app.route("/benchmark")
def get_benchmark():
    # Static benchmark — would need real market data for live version
    return jsonify([])


# ── Bot Plugin Endpoints ──────────────────────────────────────────────────────

@app.route("/upload-bot", methods=["POST", "OPTIONS"])
def upload_bot():
    """Receive a .py bot file, save it to bots/ folder."""
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".py"):
        return jsonify({"success": False, "error": "Only .py files are accepted"}), 400

    # Sanitize filename
    filename = os.path.basename(file.filename)
    save_path = os.path.join(BOTS_DIR, filename)
    file.save(save_path)

    return jsonify({"success": True, "filename": filename, "path": save_path})


@app.route("/run-bot", methods=["POST"])
def run_bot():
    """Run a previously uploaded bot and generate ZK input."""
    data = request.get_json()
    filename = data.get("filename")
    if not filename:
        return jsonify({"success": False, "error": "filename required"}), 400

    filepath = os.path.join(BOTS_DIR, os.path.basename(filename))
    if not os.path.exists(filepath):
        return jsonify({"success": False, "error": f"Bot file not found: {filename}"}), 404

    # Change working dir to backend root so data/ paths resolve correctly
    original_dir = os.getcwd()
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(backend_root)

    try:
        result = run_bot_plugin(filepath)
    finally:
        os.chdir(original_dir)

    return jsonify(result)


@app.route("/bots", methods=["GET"])
def list_bots():
    """List all uploaded bot files."""
    try:
        files = [f for f in os.listdir(BOTS_DIR) if f.endswith(".py")]
        return jsonify({"bots": files})
    except Exception as e:
        return jsonify({"bots": [], "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
