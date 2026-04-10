import React, { useState, useRef, useCallback } from 'react';
import { Upload, Bot, CheckCircle, XCircle, Loader2, FileCode, ChevronRight, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { uploadBot, runBot, submitProof } from '../utils/mockApi';

const EXAMPLE_BOT = `BOT_NAME        = "My Strategy Bot"
INITIAL_CAPITAL = 1000

def run() -> list[dict]:
    trades = []
    # ... your strategy logic ...
    trades.append({
        "date":     "2026-01-01",
        "asset":    "BTC",
        "action":   "SELL",
        "price":    95000.0,
        "quantity": 0.01,
        "pnl":      45.20,
    })
    return trades`;

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
        <span className="text-gray-500 text-xs font-mono">python</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-mono transition-colors">
          {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto bg-black/30 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepBadge({ n }) {
  return (
    <span className="w-6 h-6 rounded-full bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-bold flex items-center justify-center shrink-0">
      {n}
    </span>
  );
}

export default function BotSubmitPage() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [stage,     setStage]     = useState('idle'); // idle | uploading | running | done | error
  const [result,    setResult]    = useState(null);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [proofStage, setProofStage] = useState('idle'); // idle | submitting | done | error
  const [proofResult, setProofResult] = useState(null);
  const inputRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f?.name.endsWith('.py')) {
      setErrorMsg('Only .py files are accepted.');
      setStage('error');
      return;
    }
    setFile(f);
    setStage('idle');
    setErrorMsg('');
    setResult(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStage('uploading');
    setErrorMsg('');

    try {
      const up = await uploadBot(file);
      if (!up.success) throw new Error(up.error);

      setStage('running');
      const run = await runBot(up.filename);
      if (!run.success) throw new Error(run.error);

      setResult(run);
      setStage('done');
    } catch (err) {
      setErrorMsg(err.message ?? 'Something went wrong');
      setStage('error');
    }
  };

  const reset = () => {
    setFile(null); setStage('idle');
    setResult(null); setErrorMsg('');
    setProofStage('idle'); setProofResult(null);
  };

  const handleSubmitProof = async () => {
    setProofStage('submitting');
    setProofResult(null);
    try {
      const data = await submitProof();
      setProofResult(data);
      setProofStage('done');
    } catch (err) {
      setProofResult({ error: err.message });
      setProofStage('error');
    }
  };

  return (
    <div className="flex-1 w-full py-12 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Submit Your Bot</h1>
          <p className="text-gray-400 text-sm">
            Connect your trading strategy to AlphaVault. Your performance gets verified on-chain via ZK proof — investors see the APY, never your strategy.
          </p>
        </div>

        {/* How it works */}
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
          <p className="text-white font-semibold text-sm uppercase tracking-widest">How it works</p>
          <div className="space-y-3">
            {[
              ['Write your bot', 'A Python file with BOT_NAME, INITIAL_CAPITAL, and a run() function that returns trades.'],
              ['Upload it here', 'Drop your .py file below. It runs in a sandboxed environment on our backend.'],
              ['We generate the ZK proof', 'Your trade data is hashed and an APY proof is submitted on-chain. Your strategy stays private.'],
              ['Investors see verified returns', 'The vault displays your ZK-verified APY. No raw trade data ever leaves your file.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex items-start gap-3">
                <StepBadge n={i + 1} />
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template */}
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <FileCode size={15} className="text-accent-indigo" />
            <p className="text-white font-semibold text-sm">Bot template</p>
          </div>
          <CodeBlock code={EXAMPLE_BOT} />
          <p className="text-gray-600 text-xs">
            Required fields per trade: <span className="text-gray-400 font-mono">date, asset, action, price, quantity, pnl</span>
          </p>
        </div>

        {/* Upload zone */}
        {stage !== 'done' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-10 flex flex-col items-center gap-4 text-center
              ${dragging ? 'border-accent-blue bg-accent-blue/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
          >
            <input ref={inputRef} type="file" accept=".py" className="hidden" onChange={onInputChange} />
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <Upload size={24} className="text-accent-blue" />
            </div>
            {file ? (
              <div>
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-gray-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium">Drop your bot .py file here</p>
                <p className="text-gray-500 text-sm mt-1">or click to browse</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Failed</p>
              <p className="text-red-400/70 text-xs mt-0.5 font-mono">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Submit button */}
        {file && stage !== 'done' && (
          <button
            onClick={handleSubmit}
            disabled={stage === 'uploading' || stage === 'running'}
            className="w-full btn-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {stage === 'uploading' && <><Loader2 size={16} className="animate-spin" /> Uploading...</>}
            {stage === 'running'   && <><Loader2 size={16} className="animate-spin" /> Running bot...</>}
            {(stage === 'idle' || stage === 'error') && <><Bot size={16} /> Run & Submit Bot</>}
          </button>
        )}

        {/* Success result */}
        {stage === 'done' && result && (
          <div className="glass rounded-2xl p-6 border border-accent-green/20 space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-accent-green" />
              <p className="text-white font-semibold">Bot ran successfully</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                ['Bot',          result.botName],
                ['Total Trades', result.totalTrades],
                ['Net Profit',   `$${result.totalProfit}`],
                ['Final Value',  `$${result.finalValue}`],
                ['APY',          `${result.apyPercent}%`],
                ['Win Rate',     `${result.winRate}%`],
              ].map(([label, val]) => (
                <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white font-semibold text-sm truncate">{val}</p>
                </div>
              ))}
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Trade Data Hash (on-chain commitment)</p>
              <p className="text-gray-300 text-xs font-mono break-all">{result.tradeDataHash}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-3">
                {/* Submit Proof On-Chain button */}
                {proofStage === 'idle' && (
                  <button
                    onClick={handleSubmitProof}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green font-semibold text-sm hover:bg-accent-green/20 transition-colors"
                  >
                    <ShieldCheck size={16} /> Submit Proof On-Chain
                  </button>
                )}
                {proofStage === 'submitting' && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm">
                    <Loader2 size={16} className="animate-spin" /> Generating ZK proof... (2-3 min)
                  </div>
                )}
                {proofStage === 'done' && proofResult?.txId && (
                  <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-accent-green" />
                      <p className="text-accent-green text-sm font-semibold">Proof submitted on-chain!</p>
                    </div>
                    <p className="text-gray-400 text-xs font-mono break-all">{proofResult.txId}</p>
                    <a
                      href={`https://explorer.preprod.midnight.network/transactions/${proofResult.txId}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-accent-blue text-xs hover:underline"
                    >
                      <ExternalLink size={11} /> View on Explorer
                    </a>
                  </div>
                )}
                {proofStage === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-400 text-xs">{proofResult?.error}</p>
                  </div>
                )}
              </div>
              <button onClick={reset} className="btn-ghost px-6 py-3 rounded-xl text-sm self-start">
                Submit another bot
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
