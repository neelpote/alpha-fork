import React from 'react';

const TradesTable = ({ trades }) => {
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Recent Verified Trades</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
              <th className="p-4 font-medium px-6">Date</th>
              <th className="p-4 font-medium px-6">Asset</th>
              <th className="p-4 font-medium px-6">Action</th>
              <th className="p-4 font-medium px-6 text-right">Price</th>
              <th className="p-4 font-medium px-6 text-right">Quantity</th>
              <th className="p-4 font-medium px-6 text-right">PnL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trades.map((trade) => {
              const pnlValue = parseFloat(trade.pnl);
              const isProfit = pnlValue >= 0;

              return (
                <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 px-6 text-gray-300">{trade.date}</td>
                  <td className="p-4 px-6">
                    <span className="font-bold text-white">{trade.asset}</span>
                  </td>
                  <td className="p-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.action === "BUY" ? "bg-accent-blue/20 text-accent-blue" : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-right text-gray-300">
                    ${parseFloat(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 px-6 text-right text-gray-300">{trade.quantity}</td>
                  <td className={`p-4 px-6 text-right font-bold ${isProfit ? 'text-semantic-profit' : 'text-semantic-loss'}`}>
                    {isProfit ? '+' : ''}${Math.abs(pnlValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {trades.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No recent trades found.
        </div>
      )}
    </div>
  );
};

export default TradesTable;
