import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import EquityChart from '../components/EquityChart';
import TradesTable from '../components/TradesTable';
import { fetchMetrics, fetchEquity, fetchTrades } from '../utils/mockApi';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [equityData, setEquityData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [metricsRes, equityRes, tradesRes] = await Promise.all([
          fetchMetrics(),
          fetchEquity(),
          fetchTrades()
        ]);
        setMetrics(metricsRes);
        setEquityData(equityRes);
        setTradesData(tradesRes);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-accent-blue">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-gray-400 font-medium tracking-widest uppercase">Syncing On-Chain Data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Investor Dashboard</h1>
            <p className="text-gray-400">Real-time performance metrics verified via zk-SNARKs.</p>
          </div>
          <div className="bg-semantic-profit/10 border border-semantic-profit/20 text-semantic-profit px-4 py-2 rounded-lg font-mono text-sm uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-semantic-profit animate-pulse bg-glow"></span>
            Live Verification Active
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="APY" value={metrics.apy} isPercentage={true} highlight={true} />
          <MetricCard title="Total Profit" value={metrics.totalProfit} />
          <MetricCard title="Max Drawdown" value={metrics.maxDrawdown} isPercentage={true} highlight={true} />
          <MetricCard title="Sharpe Ratio" value={metrics.sharpeRatio} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
          <div className="xl:col-span-2 flex flex-col">
            <EquityChart data={equityData} />
          </div>
          <div className="xl:col-span-1 flex flex-col">
            <TradesTable trades={tradesData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
