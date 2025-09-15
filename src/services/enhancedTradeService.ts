import { supabase } from '../config/supabase';
import { EnhancedTrade, TradeHistoryFilters, TradingMode, MarketRegime } from '../types';

class EnhancedTradeService {
  async saveTrade(trade: Omit<EnhancedTrade, 'id' | 'created_at'>): Promise<EnhancedTrade | null> {
    try {
      const { data, error } = await supabase
        .from('enhanced_trades')
        .insert([{
          ...trade,
          correlation_cluster: JSON.stringify(trade.correlation_cluster)
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        correlation_cluster: JSON.parse(data.correlation_cluster || '[]')
      };
    } catch (error) {
      console.error('Error saving enhanced trade:', error);
      return null;
    }
  }

  async getTradeHistory(filters?: TradeHistoryFilters): Promise<EnhancedTrade[]> {
    try {
      let query = supabase
        .from('enhanced_trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.asset) {
        query = query.eq('asset', filters.asset);
      }

      if (filters?.action) {
        query = query.ilike('action', `%${filters.action}%`);
      }

      if (filters?.mode) {
        query = query.eq('mode', filters.mode);
      }

      if (filters?.regime) {
        query = query.eq('regime', filters.regime);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.search) {
        query = query.or(`asset.ilike.%${filters.search}%,ai_reason.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(trade => ({
        ...trade,
        correlation_cluster: JSON.parse(trade.correlation_cluster || '[]')
      }));
    } catch (error) {
      console.error('Error fetching enhanced trade history:', error);
      return [];
    }
  }

  async getDailySummary(date: string): Promise<{
    totalTrades: number;
    profitableTrades: number;
    totalPnL: number;
    bestTrade: EnhancedTrade | null;
    worstTrade: EnhancedTrade | null;
    modeBreakdown: { [key in TradingMode]: number };
    regimeBreakdown: { [key in MarketRegime]: number };
  }> {
    try {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const trades = await this.getTradeHistory({
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString()
      });

      const totalTrades = trades.length;
      const profitableTrades = trades.filter(t => t.nav_after > t.nav_before).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.nav_after - t.nav_before), 0);

      const sortedByPnL = trades.sort((a, b) => (b.nav_after - b.nav_before) - (a.nav_after - a.nav_before));
      const bestTrade = sortedByPnL[0] || null;
      const worstTrade = sortedByPnL[sortedByPnL.length - 1] || null;

      const modeBreakdown = trades.reduce((acc, trade) => {
        acc[trade.mode] = (acc[trade.mode] || 0) + 1;
        return acc;
      }, {} as { [key in TradingMode]: number });

      const regimeBreakdown = trades.reduce((acc, trade) => {
        acc[trade.regime] = (acc[trade.regime] || 0) + 1;
        return acc;
      }, {} as { [key in MarketRegime]: number });

      return {
        totalTrades,
        profitableTrades,
        totalPnL,
        bestTrade,
        worstTrade,
        modeBreakdown,
        regimeBreakdown
      };
    } catch (error) {
      console.error('Error generating daily summary:', error);
      return {
        totalTrades: 0,
        profitableTrades: 0,
        totalPnL: 0,
        bestTrade: null,
        worstTrade: null,
        modeBreakdown: {} as { [key in TradingMode]: number },
        regimeBreakdown: {} as { [key in MarketRegime]: number }
      };
    }
  }

  exportToCSV(trades: EnhancedTrade[]): void {
    const headers = [
      'Timestamp', 'Asset', 'Action', 'Quantity', 'Price', 'NAV Before', 'NAV After', 'P&L',
      'Position Size %', 'AI Recommendation', 'AI Confidence', 'AI Reason', 'Model Version',
      'Market Regime', 'Stop Loss', 'Take Profit', 'Source', 'Mode', 'Trade ID', 'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        trade.timestamp_utc,
        trade.asset,
        trade.action,
        trade.quantity,
        trade.price,
        trade.nav_before,
        trade.nav_after,
        (trade.nav_after - trade.nav_before).toFixed(2),
        (trade.position_size_fraction * 100).toFixed(2) + '%',
        trade.ai_recommendation,
        trade.ai_confidence + '%',
        `"${trade.ai_reason.replace(/"/g, '""')}"`,
        trade.model_version,
        trade.regime,
        trade.stop_loss || '',
        trade.take_profit || '',
        trade.source,
        trade.mode,
        trade.trade_id || '',
        `"${(trade.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced_trade_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const enhancedTradeService = new EnhancedTradeService();