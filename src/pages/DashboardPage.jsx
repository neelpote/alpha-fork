import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import EquityChart from '../components/EquityChart';
import TradesTable from '../components/TradesTable';
import PortfolioAllocation from '../components/PortfolioAllocation';
import AssetPerformanceChart from '../components/AssetPerformanceChart';
import RiskMetricsDashboard from '../components/RiskMetricsDashboard';
import DrawdownChart from '../components/DrawdownChart';
import MonthlyReturnsChart from '../components/MonthlyReturnsChart';
import RollingMetricsChart from '../components/RollingMetricsChart';
import BenchmarkChart from '../components/BenchmarkChart';
import TransactionModal from '../components/TransactionModal';
import ZKProofModal from '../components/ZKProofModal';
import EpochStatus from '../components/EpochStatus';
import {
  fetchMetrics, fetchEquity, fetchTrades,
  fetchAllocation, fetchAssetPerformance, fetchRiskMetrics,
  fetchDrawdown, fetchMonthlyReturns, fetchRollingMetrics, fetchBenchmark,
} from '../utils/mockApi';
import { useWallet } from '../context/WalletContext';
import { Loader2, ShieldCheck, Cpu, TrendingUp, Lock } from 'lucide-react';

const DashboardPage = () => {
  const [metrics, setMetrics]               = useState(null);
  const [equityData, setEquityData]         = useState([]);
  const [tradesData, setTradesData]         = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [assetPerfData, setAssetPerfData]   = useState([]);
  const [riskData, setRiskData]             = useState(null);
  const [drawdownData, setDrawdownData]     = useState([]);
  const [monthlyData, setMonthlyData]       = useState([]);
  const [rollingData, setRollingData]       = useState([]);
  const [benchmarkData, setBenchmarkData]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [modal, setModal]                   = useState(null);
  const [txState, setTxState]               = useState({ status: 'idle', txId: null, error: null });
  const [lastVerified, setLastVerified]     = useState('2 hours ago');
  const [zkFlash, setZkFlash]               = useState(false);

  const { connected, api: walletApi } = useWallet();

  const handleCloseModal = () => {
    setModal(null);
    setTxState({ status: 'idle', txId: null, error: null });
  };

  const handleTxSubmit = async (units) => {
    if (units === null) {
      setTxState({ status: 'idle', txId: null, error: null });
      return;
    }
    setTxState({ status: 'loading', txId: null, error: null });

    try {
      // Simulate transaction (contract artifacts not compiled yet)
      await new Promise(r => setTimeout(r, 1800));
      const mockTxId = '0x' + Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      setTxState({ status: 'success', txId: mockTxId, error: null, isOnChain: false });
    } catch (err) {
      setTxState({ status: 'error', txId: null, error: err.message ?? 'Transaction failed' });
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [m, e, t, a, ap, r] = await Promise.all([
          fetchMetrics(), fetchEquity(), fetchTrades(),
          fetchAllocation(), fetchAssetPerformance(), fetchRiskMetrics(),
        ]);
        const [dd, mr, rm, bm] = await Promise.all([
          fetchDrawdown(), fetchMonthlyReturns(), fetchRollingMetrics(), fetchBenchmark(),
        ]);
        if (cancelled) return;
        setMetrics(m); setEquityData(e); setTradesData(t);
        setAllocationData(a); setAssetPerfData(ap); setRiskData(r);
        setDrawdownData(dd); setMonthlyData(mr); setRollingData(rm); setBenchmarkData(bm);
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Backend fetch failed:', err.message);
          setMetrics(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleZKVerified = () => {
    setLastVerified('Just now');
    setZkFlash(true);
    setTimeout(() => setZkFlash(false), 3500);
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-accent-blue">
        <Loader2 size={48} className="animate-spin mb-4" aria-hidden="true" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Loading from backend...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-white font-bold text-xl mb-2">Backend not running</p>
        <p className="text-gray-400 text-sm mb-4">Start the backend to see real data:</p>
        <code className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-accent-blue text-sm font-mono">
          cd alphavault-backend && python3 -m flask --app api/server.py run --port 5000
        </code>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full py-12 px-6 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-transparent to-background/60 pointer-events-none" />

      <div className="relative z-10 max-w-site mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Investor Dashboard</h1>
            <p className="text-gray-500 text-sm font-mono">Proof-backed returns · On-chain verified performance</p>
          </div>
          <button
            onClick={() => setModal('zk')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo text-sm font-semibold hover:bg-accent-indigo/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group"
          >
            <ShieldCheck size={15} className="group-hover:scale-110 transition-transform" />
            Generate ZK Proof
          </button>
        </div>

        {/* Epoch status */}
        <EpochStatus lastVerified={lastVerified} />

        {/* ZK flash banner */}
        {zkFlash && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-accent-green/10 border border-accent-green/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={18} className="text-accent-green shrink-0" />
            <p className="text-accent-green text-sm font-mono font-semibold">
              ✅ ZK Proof verified on-chain · APY updated · Last Verified: Just now
            </p>
          </div>
        )}

        {/* Vault card */}
        <div className="glass p-8 rounded-2xl relative overflow-hidden border border-white/5 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-green opacity-60" />
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">AlphaVault AI Strategy</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30 text-xs font-mono uppercase tracking-wider animate-pulse">Active</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-500">
                <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-accent-green" /> ZK-Verified APY</span>
                <span className="flex items-center gap-1"><Lock size={11} className="text-accent-blue" /> Non-Custodial</span>
                <span className="flex items-center gap-1"><Cpu size={11} className="text-accent-indigo" /> AI-Powered</span>
                <span className="flex items-center gap-1"><TrendingUp size={11} className="text-yellow-400" /> Proof-backed returns</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8 lg:gap-10 w-full lg:w-auto">
              <div>
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Total Value Locked</p>
                <p className="text-2xl font-bold text-white data-value">
                  {metrics.finalValue
                    ? `$${Number(metrics.finalValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">ZK-Verified APY</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold data-value transition-colors duration-500 ${zkFlash ? 'text-white' : 'text-accent-green'}`}>
                    +{metrics.apy}%
                  </p>
                  <span className="text-[10px] text-gray-600 font-mono">(ZK Verified)</span>
                </div>
              </div>
              <div className="flex gap-3 ml-auto lg:ml-0">
                <button onClick={() => setModal('deposit')} className="btn-primary px-6 py-2.5 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-transform">Deposit</button>
                <button onClick={() => setModal('withdraw')} className="btn-ghost px-6 py-2.5 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-transform">Withdraw</button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard title="ZK-Verified APY" value={metrics.apy}         isPercentage highlight />
          <MetricCard title="Total Profit"     value={metrics.totalProfit} isCurrency />
          <MetricCard title="Max Drawdown"     value={metrics.maxDrawdown} isPercentage highlight />
          <MetricCard title="Sharpe Ratio"     value={metrics.sharpeRatio} />
        </div>

        {/* Equity + Trades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
          <div className="xl:col-span-2"><EquityChart data={equityData} /></div>
          <div className="xl:col-span-1"><TradesTable trades={tradesData} /></div>
        </div>

        {/* Analytics */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-white">Analytics Dashboards</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">On-chain verified</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RiskMetricsDashboard data={riskData} />
            <PortfolioAllocation data={allocationData} />
          </div>
          <AssetPerformanceChart data={assetPerfData} />
        </div>

      </div>

      {/* Modals */}
      {(modal === 'deposit' || modal === 'withdraw') && (
        <TransactionModal
          type={modal}
          onClose={handleCloseModal}
          onSubmit={handleTxSubmit}
          txState={txState}
          walletConnected={connected}
        />
      )}
      {modal === 'zk' && (
        <ZKProofModal onClose={() => setModal(null)} onVerified={handleZKVerified} />
      )}
    </div>
  );
};

export default DashboardPage;
