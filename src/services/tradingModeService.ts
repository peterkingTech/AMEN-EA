import { TradingMode, TradingSettings, AIRecommendation, MarketRegimeData, EnhancedTrade } from '../types';
import { riskManagementService } from './riskManagementService';

class TradingModeService {
  private settings: TradingSettings = {
    mode: 'MANUAL',
    maxRiskPerTrade: 0.02, // 2%
    confidenceThreshold: 70,
    enableStopLoss: true,
    enableTakeProfit: true,
    enableDualStop: false,
    pauseOnDecline: true,
    declineThreshold: -0.05, // -5%
    cooldownPeriod: 300000, // 5 minutes
    maxCorrelatedPositions: 3
  };

  private cooldownTimers: Map<string, number> = new Map();

  getSettings(): TradingSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<TradingSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  shouldExecuteAutomatically(
    recommendation: AIRecommendation,
    regimeData: MarketRegimeData,
    asset: string
  ): { execute: boolean; reason: string } {
    // Check if in cooldown
    const cooldownEnd = this.cooldownTimers.get(asset);
    if (cooldownEnd && Date.now() < cooldownEnd) {
      return {
        execute: false,
        reason: `Asset ${asset} is in cooldown period`
      };
    }

    // Mode-specific logic
    switch (this.settings.mode) {
      case 'MANUAL':
        return { execute: false, reason: 'Manual mode - user confirmation required' };
      
      case 'ASSISTED':
        return { execute: false, reason: 'Assisted mode - user confirmation required' };
      
      case 'PAPER':
        return { execute: true, reason: 'Paper trading mode - simulating execution' };
      
      case 'AUTOPILOT':
      case 'HYBRID':
        return this.evaluateAutopilotExecution(recommendation, regimeData);
      
      default:
        return { execute: false, reason: 'Unknown trading mode' };
    }
  }

  private evaluateAutopilotExecution(
    recommendation: AIRecommendation,
    regimeData: MarketRegimeData
  ): { execute: boolean; reason: string } {
    // Confidence threshold check
    if (recommendation.confidence < this.settings.confidenceThreshold) {
      return {
        execute: false,
        reason: `AI confidence ${recommendation.confidence}% below threshold ${this.settings.confidenceThreshold}%`
      };
    }

    // Market regime check
    if (!regimeData.allowTrading) {
      return {
        execute: false,
        reason: `Market regime ${regimeData.regime} does not allow automatic trading`
      };
    }

    // Only execute BUY/SELL recommendations in autopilot
    if (recommendation.action === 'HOLD') {
      return {
        execute: false,
        reason: 'HOLD recommendation - no action required'
      };
    }

    return {
      execute: true,
      reason: `Autopilot execution: ${recommendation.confidence}% confidence, ${regimeData.regime} regime`
    };
  }

  setCooldown(asset: string, durationMs?: number): void {
    const duration = durationMs || this.settings.cooldownPeriod;
    this.cooldownTimers.set(asset, Date.now() + duration);
  }

  clearCooldown(asset: string): void {
    this.cooldownTimers.delete(asset);
  }

  getCooldownStatus(asset: string): { inCooldown: boolean; remainingMs: number } {
    const cooldownEnd = this.cooldownTimers.get(asset);
    if (!cooldownEnd) {
      return { inCooldown: false, remainingMs: 0 };
    }

    const remainingMs = Math.max(0, cooldownEnd - Date.now());
    return {
      inCooldown: remainingMs > 0,
      remainingMs
    };
  }

  formatModeDescription(mode: TradingMode): string {
    switch (mode) {
      case 'MANUAL':
        return 'Manual - You control all trades';
      case 'ASSISTED':
        return 'Assisted - AI suggests, you confirm';
      case 'AUTOPILOT':
        return 'Autopilot - AI executes automatically';
      case 'HYBRID':
        return 'Hybrid - Auto with risk controls';
      case 'PAPER':
        return 'Paper - Simulate trades only';
      default:
        return 'Unknown mode';
    }
  }

  getModeColor(mode: TradingMode): string {
    switch (mode) {
      case 'MANUAL':
        return 'text-blue-400';
      case 'ASSISTED':
        return 'text-green-400';
      case 'AUTOPILOT':
        return 'text-red-400';
      case 'HYBRID':
        return 'text-yellow-400';
      case 'PAPER':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  }
}

export const tradingModeService = new TradingModeService();