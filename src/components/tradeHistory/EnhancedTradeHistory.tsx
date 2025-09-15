import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Calendar, TrendingUp, TrendingDown, Minus, Brain, User, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EnhancedTrade, TradeHistoryFilters, TradingMode, MarketRegime } from '../../types';
import { enhancedTradeService } from '../../services/enhancedTradeService';
import { SUPPORTED_ASSETS } from '../../config/constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const EnhancedTradeHistory: React.FC = () => {
  const [trades, setTrades] = useState<EnhancedTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TradeHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const data = await enhancedTradeService.getTradeHistory(filters);
      setTrades(data);
    } catch (error) {
      toast.error('Failed to fetch trade history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TradeHistoryFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const exportCSV = () => {
    if (trades.length === 0) {
      toast.error('No trades to export');
      return;
    }
    
    enhancedTradeService.exportToCSV(trades);
    toast.success('Enhanced trade history exported successfully!');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('BUY')) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (action.includes('SELL')) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('BUY')) return 'text-green-400';
    if (action.includes('SELL')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'AI': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'MANUAL': return <User className="w-4 h-4 text-green-400" />;
      case 'SYSTEM': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getModeColor = (mode: TradingMode) => {
    switch (mode) {
      case 'MANUAL': return 'text-blue-400 bg-blue-900/20';
      case 'ASSISTED': return 'text-green-400 bg-green-900/20';
      case 'AUTOPILOT': return 'text-red-400 bg-red-900/20';
      case 'HYBRID': return 'text-yellow-400 bg-yellow-900/20';
      case 'PAPER': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getRegimeColor = (regime: MarketRegime) => {
    switch (regime) {
      case 'BULLISH': return 'text-green-400';
      case 'BEARISH': return 'text-red-400';
      case 'VOLATILE': return 'text-yellow-400';
      case 'CRASH_IMMINENT': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const calculatePnL = (trade: EnhancedTrade) => {
    return trade.nav_after - trade.nav_before;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    fetchTrades();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Enhanced Trade History</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Asset</label>
                <select
                  value={filters.asset || ''}
                  onChange={(e) => handleFilterChange('asset', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">All Assets</option>
                  {SUPPORTED_ASSETS.map(asset => (
                    <option key={asset.id} value={asset.symbol}>{asset.symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Action</label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">All Actions</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                  <option value="HOLD">Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mode</label>
                <select
                  value={filters.mode || ''}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">All Modes</option>
                  <option value="MANUAL">Manual</option>
                  <option value="ASSISTED">Assisted</option>
                  <option value="AUTOPILOT">Autopilot</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PAPER">Paper</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">All Sources</option>
                  <option value="AI">AI</option>
                  <option value="MANUAL">Manual</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search trades..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400">Loading enhanced trade history...</span>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {trades.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400">No trades found</div>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your filters or execute some trades first.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date/Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        P&L
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        AI Confidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Regime
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reasoning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {trades.map((trade) => {
                      const pnl = calculatePnL(trade);
                      const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
                      
                      return (
                        <tr key={trade.id} className="hover:bg-gray-750 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(trade.timestamp_utc).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {trade.asset}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className={`flex items-center space-x-1 ${getActionColor(trade.action)}`}>
                              {getActionIcon(trade.action)}
                              <span className="font-semibold">{trade.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatCurrency(trade.price)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`font-semibold ${pnlColor}`}>
                              {formatCurrency(pnl)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center">
                              <div className="w-12 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${trade.ai_confidence}%` }}
                                />
                              </div>
                              <span className="text-sm">{trade.ai_confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getModeColor(trade.mode)}`}>
                              {trade.mode}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`font-semibold ${getRegimeColor(trade.regime)}`}>
                              {trade.regime}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-1">
                              {getSourceIcon(trade.source)}
                              <span className="text-gray-300">{trade.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300 max-w-xs">
                            <span title={trade.ai_reason} className="truncate block">
                              {trade.ai_reason}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};