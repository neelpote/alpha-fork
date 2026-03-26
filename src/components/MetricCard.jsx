import React from 'react';

const MetricCard = ({ title, value, isPercentage, highlight }) => {
  
  const formattedValue = isPercentage 
    ? `${value}%` 
    : title.includes("Profit") 
      ? `$${parseFloat(value).toLocaleString()}` 
      : value;

  let colorClass = "text-white";
  if (highlight) {
    const numericValue = parseFloat(value);
    if (numericValue > 0) colorClass = "text-semantic-profit";
    if (numericValue < 0) colorClass = "text-semantic-loss";
  }

  return (
    <div className="glass p-6 rounded-2xl flex flex-col justify-center">
      <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</h4>
      <div className={`text-3xl font-bold ${colorClass}`}>
        {formattedValue}
      </div>
    </div>
  );
};

export default MetricCard;
