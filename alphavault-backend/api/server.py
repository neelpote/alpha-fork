from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import pandas as pd
import os
import sys
from datetime import datetime

# Allow imports from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.plugin_runner import run_bot_plugin

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

# Resolve paths relative to the backend root (works locally and on Railway)
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR  = os.path.join(BACKEND_ROOT, "data")
BOTS_DIR  = os.path.join(BACKEND_ROOT, "bots")
os.makedirs(BOTS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename)) as f:
        return json.load(f)

def load_csv(filename):
    return pd.read_csv(os.path.join(DATA_DIR, filename))

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


# ── Live Data Endpoints ───────────────────────────────────────────────────────

# Shared bot state (updated by /start-bot, /stop-bot)
_bot_state = {
    "running": False,
    "started_at": None,
    "iteration": 0,
    "last_prices": None,
    "last_tick": None,
    "capital": None,
    "open_positions": {},
}

@app.route("/live-prices")
def live_prices():
    """Fetch current BTC/ETH/SOL prices from CoinGecko."""
    from src.trading_bot import fetch_prices
    prices = fetch_prices()
    if prices is None:
        return jsonify({"error": "CoinGecko unavailable"}), 503
    # Update shared state
    _bot_state["last_prices"] = prices
    _bot_state["last_tick"] = datetime.utcnow().isoformat() + "Z"
    return jsonify({
        "prices": prices,
        "timestamp": _bot_state["last_tick"],
    })

@app.route("/bot-status")
def bot_status():
    """Return current bot running state and latest metrics."""
    try:
        metrics = load_json("metrics.json")
    except Exception:
        metrics = {}
    return jsonify({
        "running":       _bot_state["running"],
        "started_at":    _bot_state["started_at"],
        "iteration":     _bot_state["iteration"],
        "last_tick":     _bot_state["last_tick"],
        "last_prices":   _bot_state["last_prices"],
        "open_positions": _bot_state["open_positions"],
        "capital":       _bot_state["capital"] or metrics.get("final_value"),
        "total_trades":  metrics.get("total_trades", 0),
        "apy_percent":   metrics.get("apy_percent", 0),
    })


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

@app.route("/contract-state")
def get_contract_state():
    """Fetch live on-chain state from the Midnight indexer."""
    import urllib.request
    CONTRACT_ADDRESS = "52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e"
    INDEXER = "https://indexer.preprod.midnight.network/api/v3/graphql"
    query = '{"query":"{ contractState(address: \\"%s\\") { state } }"}' % CONTRACT_ADDRESS
    try:
        req = urllib.request.Request(
            INDEXER,
            data=query.encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read())
        contract_state = data.get("data", {}).get("contractState", {})
        if not contract_state:
            return jsonify({"error": "Contract not found on indexer"}), 404
        return jsonify({
            "contractAddress": CONTRACT_ADDRESS,
            "network": "preprod",
            "explorerUrl": f"https://explorer.preprod.midnight.network/contracts/{CONTRACT_ADDRESS}",
            "state": contract_state.get("state"),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


BALANCES_FILE = os.path.join(DATA_DIR, "investor_balances.json")

def load_balances():
    if os.path.exists(BALANCES_FILE):
        with open(BALANCES_FILE) as f:
            return json.load(f)
    return {}

def save_balances(balances):
    os.makedirs(os.path.dirname(BALANCES_FILE), exist_ok=True)
    with open(BALANCES_FILE, "w") as f:
        json.dump(balances, f, indent=2)

@app.route("/trade-commitment")
def get_trade_commitment():
    """Return the on-chain tradeDataCommitment hash and the local trade hash for verification."""
    try:
        zk_input_path = os.path.join(DATA_DIR, "zk_input.json")
        with open(zk_input_path) as f:
            zk = json.load(f)
        return jsonify({
            "onChainHash": zk.get("tradeDataHash"),
            "description": zk.get("description"),
            "contractAddress": "52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e",
            "explorerUrl": "https://explorer.preprod.midnight.network/contracts/52752c94092ffcca7116e2dabc783048da21d36bf2d58214392d2d787fc3dd4e",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/verify-trades", methods=["POST"])
def verify_trades():
    """Verify that uploaded CSV matches the on-chain tradeDataCommitment hash."""
    import hashlib
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    csv_bytes = file.read()
    computed_hash = hashlib.sha256(csv_bytes).hexdigest()

    # Also try normalizing line endings
    normalized = csv_bytes.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
    normalized_hash = hashlib.sha256(normalized).hexdigest()

    zk_input_path = os.path.join(DATA_DIR, "zk_input.json")
    try:
        with open(zk_input_path) as f:
            zk = json.load(f)
        on_chain_hash = zk.get("tradeDataHash")
    except Exception:
        return jsonify({"error": "No ZK input found — run a bot first"}), 404

    trades_path = os.path.join(DATA_DIR, "trades.csv")
    stored_hash = None
    if os.path.exists(trades_path):
        with open(trades_path, "rb") as f:
            stored_hash = hashlib.sha256(f.read()).hexdigest()

    match = computed_hash == on_chain_hash or normalized_hash == on_chain_hash

    return jsonify({
        "match": match,
        "computedHash": computed_hash,
        "onChainHash": on_chain_hash,
        "storedHash": stored_hash,
        "message": "✅ Trade data verified — matches on-chain commitment" if match else "❌ Hash mismatch — this CSV does not match the committed trade data",
    })


def get_investor_balance():
    """Get the investor's vault balance (tracked locally)."""
    wallet_addr = request.args.get("address", "default")
    balances = load_balances()
    amount = balances.get(wallet_addr, 0)
    total_tvl = sum(balances.values())
    return jsonify({
        "address": wallet_addr,
        "balance": amount,
        "balanceNight": amount / 1_000_000,
        "totalValueLocked": total_tvl,
        "totalValueLockedNight": total_tvl / 1_000_000,
    })



@app.route("/submit-proof", methods=["POST"])
def submit_proof():
    """Run update-performance.mjs and return the transaction ID."""
    import subprocess
    seed = os.environ.get("MIDNIGHT_SEED", "")
    if not seed:
        return jsonify({"error": "MIDNIGHT_SEED not set on server"}), 400

    project_root = os.path.dirname(BACKEND_ROOT)
    env = {**os.environ, "MIDNIGHT_SEED": seed}
    result = subprocess.run(
        ["node", os.path.join(project_root, "scripts", "update-performance.mjs")],
        cwd=project_root, env=env, capture_output=True, text=True, timeout=300
    )
    output = result.stdout + result.stderr
    for line in output.splitlines():
        if "Transaction ID" in line:
            txId = line.split(":")[-1].strip()
            return jsonify({"success": True, "txId": txId, "output": output})
    if "APY too low" in output or "APY too high" in output:
        return jsonify({"error": "APY math mismatch — re-run the bot first", "output": output}), 400
    if "Insufficient Funds" in output:
        return jsonify({"error": "Insufficient DUST — wait a few minutes and retry", "output": output}), 400
    return jsonify({"error": "Proof submission failed", "output": output}), 500


@app.route("/build-deposit", methods=["POST"])
def build_deposit():
    """Run deposit.mjs script and return tx ID."""
    import subprocess
    data   = request.get_json() or {}
    amount = data.get("amount", "1000000")
    seed   = os.environ.get("MIDNIGHT_SEED", "")
    if not seed:
        return jsonify({"error": "MIDNIGHT_SEED not set on server"}), 400

    project_root = os.path.dirname(BACKEND_ROOT)
    env = {**os.environ, "MIDNIGHT_SEED": seed, "AMOUNT": str(amount)}
    result = subprocess.run(
        ["node", os.path.join(project_root, "scripts", "deposit.mjs")],
        cwd=project_root, env=env, capture_output=True, text=True, timeout=300
    )
    output = result.stdout + result.stderr
    for line in output.splitlines():
        if "Transaction ID" in line:
            txId = line.split(":")[-1].strip()
            wallet_addr = data.get("walletAddress", "default")
            balances = load_balances()
            balances[wallet_addr] = balances.get(wallet_addr, 0) + int(amount)
            save_balances(balances)
            return jsonify({"txId": txId, "output": output})
    return jsonify({"error": "Deposit failed — check Docker proof server is running", "output": output}), 500


@app.route("/build-withdraw", methods=["POST"])
def build_withdraw():
    """Run withdraw.mjs script and return tx ID."""
    import subprocess
    data   = request.get_json() or {}
    amount = data.get("amount", "1000000")
    seed   = os.environ.get("MIDNIGHT_SEED", "")
    if not seed:
        return jsonify({"error": "MIDNIGHT_SEED not set on server"}), 400

    project_root = os.path.dirname(BACKEND_ROOT)
    env = {**os.environ, "MIDNIGHT_SEED": seed, "AMOUNT": str(amount)}
    result = subprocess.run(
        ["node", os.path.join(project_root, "scripts", "withdraw.mjs")],
        cwd=project_root, env=env, capture_output=True, text=True, timeout=300
    )
    output = result.stdout + result.stderr
    for line in output.splitlines():
        if "Transaction ID" in line:
            txId = line.split(":")[-1].strip()
            return jsonify({"txId": txId, "output": output})
    return jsonify({"error": "Withdraw failed — check Docker proof server is running", "output": output}), 500


@app.route("/investor-balance")
def get_investor_balance():
    """Get the investor's vault balance (tracked locally)."""
    wallet_addr = request.args.get("address", "default")
    balances = load_balances()
    amount = balances.get(wallet_addr, 0)
    total_tvl = sum(balances.values())
    return jsonify({
        "address": wallet_addr,
        "balance": amount,
        "balanceNight": amount / 1_000_000,
        "totalValueLocked": total_tvl,
        "totalValueLockedNight": total_tvl / 1_000_000,
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
