import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Upload, ExternalLink, Loader2 } from 'lucide-react';

const API = (path) => `/api${path}`;

const TradeVerifyModal = ({ onClose }) => {
  const [commitment, setCommitment]   = useState(null);
  const [file, setFile]               = useState(null);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [dragging, setDragging]       = useState(false);

  useEffect(() => {
    fetch(API('/trade-commitment'))
      .then(r => r.json())
      .then(setCommitment)
      .catch(() => {});
  }, []);

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) setFile(f);
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(API('/verify-trades'), { method: 'POST', body: form });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ match: false, message: `Error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-accent-green" />
            <h2 className="text-white font-semibold text-lg">Verify Trade Data</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Explanation */}
        <p className="text-gray-400 text-sm">
          The quant's trade data hash is committed on-chain via ZK proof. Upload the trades CSV to verify it matches — without revealing the trading strategy.
        </p>

        {/* On-chain hash */}
        {commitment && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">On-Chain Commitment Hash</p>
            <p className="text-accent-green text-xs font-mono break-all">{commitment.onChainHash}</p>
            <a href={commitment.explorerUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-gray-500 text-[10px] hover:text-accent-blue transition-colors">
              <ExternalLink size={10} /> View contract on explorer
            </a>
          </div>
        )}

        {/* File drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('csv-input').click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragging ? 'border-accent-blue bg-accent-blue/5' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <input id="csv-input" type="file" accept=".csv" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <Upload size={24} className="mx-auto mb-2 text-gray-500" />
          {file
            ? <p className="text-white text-sm font-mono">{file.name}</p>
            : <p className="text-gray-500 text-sm">Drop trades.csv here or click to browse</p>
          }
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={!file || loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify Trade Data'}
        </button>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 border ${result.match
            ? 'bg-accent-green/10 border-accent-green/30'
            : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.match
                ? <ShieldCheck size={16} className="text-accent-green" />
                : <AlertCircle size={16} className="text-red-400" />}
              <p className={`text-sm font-semibold ${result.match ? 'text-accent-green' : 'text-red-400'}`}>
                {result.match ? 'Verified ✓' : 'Mismatch ✗'}
              </p>
            </div>
            <p className="text-gray-400 text-xs">{result.message}</p>
            {!result.match && result.computedHash && (
              <p className="text-gray-600 text-[10px] font-mono mt-2 break-all">
                Computed: {result.computedHash}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TradeVerifyModal;
