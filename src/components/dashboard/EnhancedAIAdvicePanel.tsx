import React from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Clock, AlertCircle } from 'lucide-react';
import { AIRecommendation, TradingMode, MarketRegimeData } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { tradingModeService } from '../../services/tradingModeService';

interface EnhancedAIAdvicePanelProps {
  recommendation: AIRecommendation | null;
  loading: boolean;
  tradingMode: TradingMode;
  regimeData: MarketRegimeData | null;
  onExecuteTrade: (action: 'BUY' | 'SELL' | 'HOLD') => void;
  cooldownStatus?: { inCooldown: boolean; remainingMs: number };
}

export const EnhancedAIAdvicePanel: React.FC<EnhancedAIAdvicePanelProps> = ({
  recommendation,
  loading,
  tradingMode,
  regimeData,
  onExecuteTrade,
  cooldownStatus
}) => {
  const getActionConfig = (action: 'BUY' | 'SELL' | 'HOLD') => {
    switch (action) {
      case 'BUY':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/20 border-green-500/30',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: TrendingUp
        };
      case 'SELL':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/20 border-red-500/30',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: TrendingDown
        };
      case 'HOLD':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20 border-yellow-500/30',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: Minus
        };
    }
  };

  const canExecuteAutomatically = recommendation && regimeData && 
    tradingModeService.shouldExecuteAutomatically(recommendation, regimeData, 'current-asset').execute;

  const isInCooldown = cooldownStatus?.inCooldown || false;
  const cooldownMinutes = cooldownStatus ? Math.ceil(cooldownStatus.remainingMs / 60000) : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">AI Trading Advisor</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded text-xs font-semibold ${tradingModeService.getModeColor(tradingMode)} bg-gray-700`}>
            {tradingMode}
          </div>
          {canExecuteAutomatically && (
            <div className="px-2 py-1 rounded text-xs font-semibold text-green-400 bg-green-900/20">
              AUTO
            </div>
          )}
        </div>
      </div>

      {isInCooldown && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">
              Cooldown Active - {cooldownMinutes} min remaining
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-400">Analyzing market data...</span>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          <div className={`rounded-lg p-4 border ${getActionConfig(recommendation.action).bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {React.createElement(getActionConfig(recommendation.action).icon, {
                  className: `w-5 h-5 ${getActionConfig(recommendation.action).color}`
                })}
                <span className={`text-lg font-bold ${getActionConfig(recommendation.action).color}`}>
                  {recommendation.action}
                </span>
                {canExecuteAutomatically && !isInCooldown && (
                  <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold animate-pulse">
                    AUTO-EXECUTING
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{recommendation.confidence}%</div>
                <div className="text-gray-400 text-sm">Confidence</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">{recommendation.reasoning}</p>
            
            {/* Additional AI insights */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700/50 rounded p-2">
                <div className="text-gray-400">Model Version</div>
                <div className="text-white font-mono">v2.3-ensemble</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2">
                <div className="text-gray-400">Features Used</div>
                <div className="text-white">MA, ATR, Volume</div>
              </div>
            </div>
          </div>

          {/* Trading restrictions */}
          {regimeData && !regimeData.allowTrading && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-semibold">
                  Trading Restricted - {regimeData.regime} Market Regime
                </span>
              </div>
            </div>
          )}

          {/* Action buttons - only show for manual/assisted modes */}
          {(tradingMode === 'MANUAL' || tradingMode === 'ASSISTED') && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onExecuteTrade('BUY')}
                disabled={isInCooldown}
                className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isInCooldown 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => onExecuteTrade('SELL')}
                disabled={isInCooldown}
                className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isInCooldown 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Sell
              </button>
              <button
                onClick={() => onExecuteTrade('HOLD')}
                disabled={isInCooldown}
                className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isInCooldown 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                Hold
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          No AI recommendation available
        </div>
      )}
    </div>
  );
};