import { supabase } from '../config/supabase';
import { Trade, TradeHistoryFilters } from '../types';

class TradeService {
  async saveTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade | null> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([trade])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving trade:', error);
      return null;
    }
  }

  async getTradeHistory(filters?: TradeHistoryFilters): Promise<Trade[]> {
    try {
      let query = supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.asset) {
        query = query.eq('asset', filters.asset);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.search) {
        query = query.or(`asset.ilike.%${filters.search}%,reasoning.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }
  }

  exportToCSV(trades: Trade[]): void {
    const headers = ['Date', 'Asset', 'Action', 'AI Recommendation', 'Confidence', 'Reasoning'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        new Date(trade.created_at).toLocaleString(),
        trade.asset,
        trade.action,
        trade.ai_recommendation,
        `${trade.confidence_score}%`,
        `"${trade.reasoning.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const tradeService = new TradeService();