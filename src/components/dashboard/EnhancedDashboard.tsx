import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Header } from './Header';
import { AssetSelector } from './AssetSelector';
import { PriceTicker } from './PriceTicker';
import { LiveChart } from './LiveChart';
import { EnhancedAIAdvicePanel } from './EnhancedAIAdvicePanel';
import { TradingModeSelector } from './TradingModeSelector';
import { MarketRegimeIndicator } from './MarketRegimeIndicator';
import { RiskMetricsPanel } from './RiskMetricsPanel';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { 
  Asset, 
  PriceData, 
  ChartData, 
  AIRecommendation, 
  TradingMode, 
  MarketRegimeData, 
  RiskMetrics,
  EnhancedTrade 
} from '../../types';
import { SUPPORTED_ASSETS, UPDATE_INTERVALS } from '../../config/constants';
import { marketDataService } from '../../services/marketDataService';
import { aiService } from '../../services/aiService';
import { enhancedTradeService } from '../../services/enhancedTradeService';
import { tradingModeService } from '../../services/tradingModeService';
import { riskManagementService } from '../../services/riskManagementService';

export const EnhancedDashboard: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(SUPPORTED_ASSETS[0]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [tradingMode, setTradingMode] = useState<TradingMode>('MANUAL');
  const [regimeData, setRegimeData] = useState<MarketRegimeData | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [currentNav, setCurrentNav] = useState(10000); // Starting NAV
  
  const [priceLoading, setPriceLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [regimeLoading, setRegimeLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'BUY' | 'SELL' | 'HOLD';
  }>({ isOpen: false, action: 'BUY' });

  // Fetch price data
  const fetchPriceData = async () => {
    if (!selectedAsset) return;
    
    setPriceLoading(true);
    try {
      const data = await marketDataService.getPrice(selectedAsset);
      if (data) {
        setPriceData(data);
      } else {
        // Use mock data if real API fails
        const mockPrice = 45000 + Math.random() * 10000;
        const mockData = marketDataService.generateMockPriceUpdate(mockPrice);
        mockData.symbol = selectedAsset.symbol;
        setPriceData(mockData);
      }
    } catch (error) {
      toast.error('Failed to fetch price data');
    } finally {
      setPriceLoading(false);
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    if (!selectedAsset) return;
    
    setChartLoading(true);
    try {
      const data = await marketDataService.getChartData(selectedAsset);
      setChartData(data);
    } catch (error) {
      toast.error('Failed to fetch chart data');
    } finally {
      setChartLoading(false);
    }
  };

  // Calculate market regime
  const calculateMarketRegime = async () => {
    if (chartData.length === 0) return;
    
    setRegimeLoading(true);
    try {
      const prices = chartData.map(d => d.price);
      const regime = riskManagementService.calculateMarketRegime(prices);
      
      // Mock additional data
      const regimeData: MarketRegimeData = {
        regime,
        confidence: 75 + Math.random() * 20,
        momentum: (Math.random() - 0.5) * 0.1,
        volatility: Math.random() * 0.05,
        volume: Math.random() * 1000000,
        timestamp: Date.now(),
        allowTrading: regime !== 'BEARISH' && regime !== 'CRASH_IMMINENT'
      };
      
      setRegimeData(regimeData);
    } catch (error) {
      toast.error('Failed to calculate market regime');
    } finally {
      setRegimeLoading(false);
    }
  };

  // Calculate risk metrics
  const calculateRiskMetrics = async () => {
    setRiskLoading(true);
    try {
      const trades = await enhancedTradeService.getTradeHistory();
      const metrics = riskManagementService.calculateRiskMetrics(trades, currentNav);
      setRiskMetrics(metrics);
    } catch (error) {
      toast.error('Failed to calculate risk metrics');
    } finally {
      setRiskLoading(false);
    }
  };

  // Get AI recommendation
  const fetchAIRecommendation = async () => {
    if (!selectedAsset || chartData.length === 0) return;
    
    setAiLoading(true);
    try {
      const recommendation = await aiService.getRecommendation(selectedAsset, chartData);
      setAiRecommendation(recommendation);
      
      // Check if should execute automatically
      if (regimeData) {
        const shouldExecute = tradingModeService.shouldExecuteAutomatically(
          recommendation, 
          regimeData, 
          selectedAsset.symbol
        );
        
        if (shouldExecute.execute && riskMetrics && !riskMetrics.pauseTrading) {
          await executeAutomaticTrade(recommendation);
        }
      }
    } catch (error) {
      toast.error('Failed to get AI recommendation');
    } finally {
      setAiLoading(false);
    }
  };

  // Execute automatic trade
  const executeAutomaticTrade = async (recommendation: AIRecommendation) => {
    if (!regimeData || !riskMetrics || !priceData) return;

    try {
      const quantity = riskManagementService.calculatePositionSize(
        0.02, // 2% base risk
        recommendation.confidence,
        riskMetrics.targetVolatility,
        riskMetrics.currentVolatility,
        tradingModeService.getSettings().maxRiskPerTrade
      );

      const tradeAmount = currentNav * quantity;
      const newNav = recommendation.action === 'BUY' 
        ? currentNav - tradeAmount 
        : currentNav + tradeAmount;

      const enhancedTrade: Omit<EnhancedTrade, 'id' | 'created_at'> = {
        timestamp_utc: new Date().toISOString(),
        asset: selectedAsset.symbol,
        action: recommendation.action === 'BUY' ? 'AUTO_BUY' : 'AUTO_SELL',
        quantity: quantity,
        price: priceData.price,
        nav_before: currentNav,
        nav_after: newNav,
        position_size_fraction: quantity,
        ai_recommendation: recommendation.action,
        ai_confidence: recommendation.confidence,
        ai_reason: recommendation.reasoning,
        model_version: 'v2.3-ensemble-2025',
        regime: regimeData.regime,
        stop_loss: riskManagementService.calculateStopLoss(priceData.price, 100, recommendation.action === 'BUY'),
        take_profit: undefined,
        source: 'AI',
        mode: tradingMode,
        trade_id: `auto-${Date.now()}`,
        notes: `Automatic execution: ${recommendation.confidence}% confidence`,
        correlation_cluster: [selectedAsset.symbol]
      };

      const savedTrade = await enhancedTradeService.saveTrade(enhancedTrade);
      if (savedTrade) {
        setCurrentNav(newNav);
        toast.success(`🤖 Auto-executed ${recommendation.action} order!`);
        
        // Set cooldown
        tradingModeService.setCooldown(selectedAsset.symbol);
      }
    } catch (error) {
      toast.error('Failed to execute automatic trade');
    }
  };

  // Handle manual trade execution
  const handleExecuteTrade = (action: 'BUY' | 'SELL' | 'HOLD') => {
    setConfirmModal({ isOpen: true, action });
  };

  const confirmTrade = async () => {
    if (!aiRecommendation || !selectedAsset || !priceData || !regimeData) return;

    try {
      const quantity = 0.01; // 1% position size for manual trades
      const tradeAmount = currentNav * quantity;
      const newNav = confirmModal.action === 'BUY' 
        ? currentNav - tradeAmount 
        : currentNav + tradeAmount;

      const enhancedTrade: Omit<EnhancedTrade, 'id' | 'created_at'> = {
        timestamp_utc: new Date().toISOString(),
        asset: selectedAsset.symbol,
        action: confirmModal.action === 'BUY' ? 'MANUAL_BUY' : 'MANUAL_SELL',
        quantity: quantity,
        price: priceData.price,
        nav_before: currentNav,
        nav_after: newNav,
        position_size_fraction: quantity,
        ai_recommendation: aiRecommendation.action,
        ai_confidence: aiRecommendation.confidence,
        ai_reason: aiRecommendation.reasoning,
        model_version: 'v2.3-ensemble-2025',
        regime: regimeData.regime,
        source: 'MANUAL',
        mode: tradingMode,
        trade_id: `manual-${Date.now()}`,
        notes: `Manual execution by user`,
        correlation_cluster: [selectedAsset.symbol]
      };

      const savedTrade = await enhancedTradeService.saveTrade(enhancedTrade);
      if (savedTrade) {
        setCurrentNav(newNav);
        toast.success(`✅ ${confirmModal.action} order executed successfully!`);
      }
    } catch (error) {
      toast.error('Failed to execute trade');
    } finally {
      setConfirmModal({ isOpen: false, action: 'BUY' });
    }
  };

  // Handle asset change
  const handleAssetChange = (asset: Asset) => {
    setSelectedAsset(asset);
    setPriceData(null);
    setChartData([]);
    setAiRecommendation(null);
    setRegimeData(null);
  };

  // Handle mode change
  const handleModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
    tradingModeService.updateSettings({ mode });
    toast.success(`Trading mode changed to ${mode}`);
  };

  // Get cooldown status
  const cooldownStatus = tradingModeService.getCooldownStatus(selectedAsset.symbol);

  // Set up intervals
  useEffect(() => {
    fetchPriceData();
    fetchChartData();
    calculateRiskMetrics();

    const priceInterval = setInterval(fetchPriceData, UPDATE_INTERVALS.PRICE_UPDATE);
    
    return () => {
      clearInterval(priceInterval);
    };
  }, [selectedAsset]);

  useEffect(() => {
    if (chartData.length > 0) {
      calculateMarketRegime();
    }
  }, [chartData]);

  useEffect(() => {
    if (chartData.length > 0 && regimeData) {
      fetchAIRecommendation();
      const aiInterval = setInterval(fetchAIRecommendation, UPDATE_INTERVALS.AI_UPDATE);
      
      return () => {
        clearInterval(aiInterval);
      };
    }
  }, [chartData, regimeData, selectedAsset, tradingMode]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top row - Asset selector, Price ticker, Trading mode */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AssetSelector 
              selectedAsset={selectedAsset}
              onAssetChange={handleAssetChange}
            />
          </div>
          <div className="lg:col-span-3">
            <PriceTicker 
              priceData={priceData}
              loading={priceLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <TradingModeSelector
              currentMode={tradingMode}
              onModeChange={handleModeChange}
            />
          </div>
        </div>

        {/* Middle row - Chart and AI advice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LiveChart 
            data={chartData}
            loading={chartLoading}
          />
          <EnhancedAIAdvicePanel 
            recommendation={aiRecommendation}
            loading={aiLoading}
            tradingMode={tradingMode}
            regimeData={regimeData}
            onExecuteTrade={handleExecuteTrade}
            cooldownStatus={cooldownStatus}
          />
        </div>

        {/* Bottom row - Market regime and Risk metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketRegimeIndicator
            regimeData={regimeData}
            loading={regimeLoading}
          />
          <RiskMetricsPanel
            riskMetrics={riskMetrics}
            loading={riskLoading}
          />
        </div>
      </main>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: 'BUY' })}
        onConfirm={confirmTrade}
        title="Confirm Trade"
        message={`Are you sure you want to execute a ${confirmModal.action} order for ${selectedAsset.symbol}?`}
        confirmText={`Execute ${confirmModal.action}`}
        confirmVariant={confirmModal.action === 'SELL' ? 'danger' : 'default'}
      />
    </div>
  );
};