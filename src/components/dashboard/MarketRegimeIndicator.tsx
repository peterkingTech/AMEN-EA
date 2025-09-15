import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from 'lucide-react';
import { MarketRegime, MarketRegimeData } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface MarketRegimeIndicatorProps {
  regimeData: MarketRegimeData | null;
  loading: boolean;
}

export const MarketRegimeIndicator: React.FC<MarketRegimeIndicatorProps> = ({
  regimeData,
  loading
}) => {
  const getRegimeConfig = (regime: MarketRegime) => {
    switch (regime) {
      case 'BULLISH':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/20 border-green-500/30',
          icon: TrendingUp,
          description: 'Strong upward momentum'
        };
      case 'BEARISH':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/20 border-red-500/30',
          icon: TrendingDown,
          description: 'Downward pressure detected'
        };
      case 'NEUTRAL':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20 border-gray-500/30',
          icon: Minus,
          description: 'Sideways market movement'
        };
      case 'VOLATILE':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20 border-yellow-500/30',
          icon: Zap,
          description: 'High volatility detected'
        };
      case 'CRASH_IMMINENT':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-900/40 border-red-600/50',
          icon: AlertTriangle,
          description: 'Severe market stress'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-gray-400 text-sm">Analyzing market...</span>
      </div>
    );
  }

  if (!regimeData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-gray-400 text-sm text-center">No regime data</div>
      </div>
    );
  }

  const config = getRegimeConfig(regimeData.regime);
  const Icon = config.icon;

  return (
    <div className={`rounded-lg p-4 border ${config.bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className={`font-bold ${config.color}`}>
            {regimeData.regime}
          </span>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">{regimeData.confidence}%</div>
          <div className="text-gray-400 text-xs">Confidence</div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-3">{config.description}</p>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Momentum</div>
          <div className={`font-semibold ${regimeData.momentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(regimeData.momentum * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Volatility</div>
          <div className={`font-semibold ${regimeData.volatility > 0.03 ? 'text-yellow-400' : 'text-green-400'}`}>
            {(regimeData.volatility * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Trading</div>
          <div className={`font-semibold ${regimeData.allowTrading ? 'text-green-400' : 'text-red-400'}`}>
            {regimeData.allowTrading ? 'ALLOWED' : 'BLOCKED'}
          </div>
        </div>
      </div>
    </div>
  );
};