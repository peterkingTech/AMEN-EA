import React from 'react';
import { Shield, AlertTriangle, TrendingDown, Pause } from 'lucide-react';
import { RiskMetrics } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RiskMetricsPanelProps {
  riskMetrics: RiskMetrics | null;
  loading: boolean;
}

export const RiskMetricsPanel: React.FC<RiskMetricsPanelProps> = ({
  riskMetrics,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-gray-400">Calculating risk...</span>
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-center">No risk data available</div>
      </div>
    );
  }

  const getDrawdownColor = (drawdown: number) => {
    if (drawdown > 0.00001) return 'text-red-400';
    if (drawdown > 0.000005) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getVolatilityColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio > 2) return 'text-red-400';
    if (ratio > 1.5) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Risk Metrics</h3>
        {riskMetrics.pauseTrading && (
          <div className="flex items-center space-x-1 text-red-400">
            <Pause className="w-4 h-4" />
            <span className="text-sm font-semibold">PAUSED</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className={`w-4 h-4 ${getDrawdownColor(riskMetrics.portfolioDrawdown)}`} />
            <span className="text-gray-300 text-sm">Portfolio Drawdown</span>
          </div>
          <div className={`text-xl font-bold ${getDrawdownColor(riskMetrics.portfolioDrawdown)}`}>
            {(riskMetrics.portfolioDrawdown * 100).toFixed(6)}%
          </div>
          <div className="text-gray-400 text-xs">
            Threshold: {(riskMetrics.maxDrawdownThreshold * 100).toFixed(6)}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${getVolatilityColor(riskMetrics.currentVolatility, riskMetrics.targetVolatility)}`} />
            <span className="text-gray-300 text-sm">Volatility</span>
          </div>
          <div className={`text-xl font-bold ${getVolatilityColor(riskMetrics.currentVolatility, riskMetrics.targetVolatility)}`}>
            {(riskMetrics.currentVolatility * 100).toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs">
            Target: {(riskMetrics.targetVolatility * 100).toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Correlation Risk</span>
          </div>
          <div className="text-xl font-bold text-white">
            {(riskMetrics.correlationRisk * 100).toFixed(1)}%
          </div>
          <div className="text-gray-400 text-xs">Asset concentration</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-4 h-4 rounded-full ${riskMetrics.pauseTrading ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-gray-300 text-sm">Trading Status</span>
          </div>
          <div className={`text-xl font-bold ${riskMetrics.pauseTrading ? 'text-red-400' : 'text-green-400'}`}>
            {riskMetrics.pauseTrading ? 'PAUSED' : 'ACTIVE'}
          </div>
          <div className="text-gray-400 text-xs">
            {riskMetrics.pauseTrading ? 'Risk limits exceeded' : 'All systems go'}
          </div>
        </div>
      </div>
    </div>
  );
};