import React from 'react';

const MetricCard = ({ title, value, isPercentage, highlight, isCurrency, icon: Icon }) => {
  const numericValue = parseFloat(value);

  let formattedValue = value;
  if (isPercentage) {
    formattedValue = numericValue > 0 ? `+${value}%` : `${value}%`;
  } else if (isCurrency) {
    formattedValue = numericValue > 0
      ? `+$${numericValue.toLocaleString()}`
      : `-$${Math.abs(numericValue).toLocaleString()}`;
  } else if (!isNaN(numericValue)) {
    formattedValue = numericValue.toLocaleString();
  }

  let valueColor = 'text-white';
  if (highlight) {
    if (numericValue > 0) valueColor = 'text-accent-green';
    if (numericValue < 0) valueColor = 'text-semantic-loss';
  }

  return (
    <div className="glass-hover p-6 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <Icon size={14} className="text-gray-500" />
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold data-value ${valueColor}`}>
        {formattedValue}
      </div>
    </div>
  );
};

export default MetricCard;
