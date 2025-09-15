import React from 'react';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AIRecommendation } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AIAdvicePanelProps {
  recommendation: AIRecommendation | null;
  loading: boolean;
  onExecuteTrade: (action: 'BUY' | 'SELL' | 'HOLD') => void;
}

export const AIAdvicePanel: React.FC<AIAdvicePanelProps> = ({
  recommendation,
  loading,
  onExecuteTrade
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

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Trading Advisor</h3>
      </div>

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
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{recommendation.confidence}%</div>
                <div className="text-gray-400 text-sm">Confidence</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{recommendation.reasoning}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onExecuteTrade('BUY')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Buy
            </button>
            <button
              onClick={() => onExecuteTrade('SELL')}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Sell
            </button>
            <button
              onClick={() => onExecuteTrade('HOLD')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Hold
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          No AI recommendation available
        </div>
      )}
    </div>
  );
};