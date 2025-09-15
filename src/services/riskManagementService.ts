import { MarketRegime, RiskMetrics, TradingSettings, EnhancedTrade } from '../types';

class RiskManagementService {
  private readonly ULTRA_CONSERVATIVE_THRESHOLD = 0.00001; // 0.00001%
  private readonly CRASH_IMMINENT_THRESHOLD = -0.05; // -5%
  private readonly HIGH_VOLATILITY_THRESHOLD = 0.03; // 3%

  calculateMarketRegime(priceData: number[], volume?: number[]): MarketRegime {
    if (priceData.length < 20) return 'NEUTRAL';

    const returns = this.calculateReturns(priceData);
    const momentum = this.calculateMomentum(returns);
    const volatility = this.calculateVolatility(returns);
    const trend = this.calculateTrend(priceData);

    // Crash detection
    const recentReturn = returns[returns.length - 1];
    if (recentReturn < this.CRASH_IMMINENT_THRESHOLD || volatility > this.HIGH_VOLATILITY_THRESHOLD * 2) {
      return 'CRASH_IMMINENT';
    }

    // Bearish conditions
    if (momentum < -0.02 && trend < -0.01) {
      return 'BEARISH';
    }

    // Bullish conditions
    if (momentum > 0.02 && trend > 0.01 && volatility < this.HIGH_VOLATILITY_THRESHOLD) {
      return 'BULLISH';
    }

    // High volatility
    if (volatility > this.HIGH_VOLATILITY_THRESHOLD) {
      return 'VOLATILE';
    }

    return 'NEUTRAL';
  }

  calculateRiskMetrics(trades: EnhancedTrade[], currentNav: number): RiskMetrics {
    const initialNav = trades.length > 0 ? trades[0].nav_before : currentNav;
    const portfolioDrawdown = ((initialNav - currentNav) / initialNav) * 100;
    
    const recentTrades = trades.slice(-10);
    const volatility = this.calculateTradeVolatility(recentTrades);
    
    const correlationRisk = this.calculateCorrelationRisk(recentTrades);
    
    return {
      portfolioDrawdown,
      maxDrawdownThreshold: this.ULTRA_CONSERVATIVE_THRESHOLD,
      currentVolatility: volatility,
      targetVolatility: 0.02, // 2%
      correlationRisk,
      pauseTrading: portfolioDrawdown > this.ULTRA_CONSERVATIVE_THRESHOLD
    };
  }

  calculatePositionSize(
    baseRisk: number,
    confidence: number,
    targetVolatility: number,
    assetVolatility: number,
    maxRiskPerTrade: number
  ): number {
    const confidenceFactor = confidence / 100;
    const volatilityFactor = targetVolatility / Math.max(assetVolatility, 0.001);
    
    let positionFraction = baseRisk * confidenceFactor * volatilityFactor;
    
    // Cap by maximum risk per trade
    positionFraction = Math.min(positionFraction, maxRiskPerTrade);
    
    return Math.max(0, Math.min(1, positionFraction));
  }

  calculateStopLoss(
    entryPrice: number,
    atr: number,
    isLong: boolean,
    multiplier: number = 2
  ): number {
    const stopDistance = atr * multiplier;
    return isLong 
      ? entryPrice - stopDistance 
      : entryPrice + stopDistance;
  }

  calculateTakeProfit(
    entryPrice: number,
    stopLoss: number,
    isLong: boolean,
    riskRewardRatio: number = 2
  ): number {
    const riskAmount = Math.abs(entryPrice - stopLoss);
    const profitTarget = riskAmount * riskRewardRatio;
    
    return isLong 
      ? entryPrice + profitTarget 
      : entryPrice - profitTarget;
  }

  shouldAllowTrading(
    regime: MarketRegime,
    riskMetrics: RiskMetrics,
    settings: TradingSettings,
    overrideRisk: boolean = false
  ): { allowed: boolean; reason: string } {
    // Ultra-conservative stop
    if (riskMetrics.portfolioDrawdown > this.ULTRA_CONSERVATIVE_THRESHOLD && !overrideRisk) {
      return {
        allowed: false,
        reason: 'Portfolio drawdown exceeds ultra-conservative threshold'
      };
    }

    // Market regime restrictions
    if ((regime === 'BEARISH' || regime === 'CRASH_IMMINENT') && !overrideRisk) {
      return {
        allowed: false,
        reason: `Market regime is ${regime} - trading halted for safety`
      };
    }

    // Risk-based pause
    if (riskMetrics.pauseTrading && !overrideRisk) {
      return {
        allowed: false,
        reason: 'Trading paused due to risk management rules'
      };
    }

    return { allowed: true, reason: 'All risk checks passed' };
  }

  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private calculateMomentum(returns: number[]): number {
    if (returns.length < 5) return 0;
    
    const recentReturns = returns.slice(-5);
    return recentReturns.reduce((sum, ret) => sum + ret, 0) / recentReturns.length;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 10) return 0;
    
    const recent = prices.slice(-10);
    const older = prices.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, price) => sum + price, 0) / recent.length;
    const olderAvg = older.reduce((sum, price) => sum + price, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg;
  }

  private calculateTradeVolatility(trades: EnhancedTrade[]): number {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(trade => 
      (trade.nav_after - trade.nav_before) / trade.nav_before
    );
    
    return this.calculateVolatility(returns);
  }

  private calculateCorrelationRisk(trades: EnhancedTrade[]): number {
    const assetCounts: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      assetCounts[trade.asset] = (assetCounts[trade.asset] || 0) + 1;
    });
    
    const totalTrades = trades.length;
    const maxConcentration = Math.max(...Object.values(assetCounts)) / totalTrades;
    
    return maxConcentration;
  }
}

export const riskManagementService = new RiskManagementService();