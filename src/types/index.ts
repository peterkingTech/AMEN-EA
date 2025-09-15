export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'forex' | 'stock';
  icon: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
}

export interface ChartData {
  time: number;
  price: number;
}

export interface AIRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: number;
}

export interface Trade {
  id: string;
  asset: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  ai_recommendation: string;
  confidence_score: number;
  reasoning: string;
  timestamp: string;
  created_at: string;
}

export interface EnhancedTrade {
  id: string;
  timestamp_utc: string;
  asset: string;
  action: 'AUTO_BUY' | 'AUTO_SELL' | 'MANUAL_BUY' | 'MANUAL_SELL' | 'HOLD';
  quantity: number;
  price: number;
  nav_before: number;
  nav_after: number;
  position_size_fraction: number;
  ai_recommendation: 'BUY' | 'SELL' | 'HOLD';
  ai_confidence: number;
  ai_reason: string;
  model_version: string;
  regime: MarketRegime;
  stop_loss?: number;
  take_profit?: number;
  source: 'AI' | 'MANUAL' | 'SYSTEM';
  mode: TradingMode;
  trade_id?: string;
  notes?: string;
  correlation_cluster: string[];
  created_at: string;
}

export type TradingMode = 'MANUAL' | 'ASSISTED' | 'AUTOPILOT' | 'HYBRID' | 'PAPER';

export type MarketRegime = 'BULLISH' | 'NEUTRAL' | 'VOLATILE' | 'BEARISH' | 'CRASH_IMMINENT';

export interface RiskMetrics {
  portfolioDrawdown: number;
  maxDrawdownThreshold: number;
  currentVolatility: number;
  targetVolatility: number;
  correlationRisk: number;
  pauseTrading: boolean;
}

export interface TradingSettings {
  mode: TradingMode;
  maxRiskPerTrade: number;
  confidenceThreshold: number;
  enableStopLoss: boolean;
  enableTakeProfit: boolean;
  enableDualStop: boolean;
  pauseOnDecline: boolean;
  declineThreshold: number;
  cooldownPeriod: number;
  maxCorrelatedPositions: number;
}

export interface MarketRegimeData {
  regime: MarketRegime;
  confidence: number;
  momentum: number;
  volatility: number;
  volume: number;
  timestamp: number;
  allowTrading: boolean;
}

export interface TradeHistoryFilters {
  asset?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  mode?: TradingMode;
  regime?: MarketRegime;
  source?: string;
}