import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceData } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PriceTickerProps {
  priceData: PriceData | null;
  loading: boolean;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({
  priceData,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-center">No price data available</div>
      </div>
    );
  }

  const isPositive = priceData.changePercent24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-white">
            ${priceData.price.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 6 
            })}
          </div>
          <div className="text-gray-400 text-sm">Current Price</div>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="text-lg font-semibold">
              {priceData.changePercent24h.toFixed(2)}%
            </span>
          </div>
          <div className={`text-sm ${changeColor}`}>
            {isPositive ? '+' : ''}${priceData.change24h.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};