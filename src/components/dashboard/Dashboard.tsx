import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Header } from './Header';
import { AssetSelector } from './AssetSelector';
import { PriceTicker } from './PriceTicker';
import { LiveChart } from './LiveChart';
import { AIAdvicePanel } from './AIAdvicePanel';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Asset, PriceData, ChartData, AIRecommendation } from '../../types';
import { SUPPORTED_ASSETS, UPDATE_INTERVALS } from '../../config/constants';
import { marketDataService } from '../../services/marketDataService';
import { aiService } from '../../services/aiService';
import { tradeService } from '../../services/tradeService';

export const Dashboard: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(SUPPORTED_ASSETS[0]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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

  // Get AI recommendation
  const fetchAIRecommendation = async () => {
    if (!selectedAsset || chartData.length === 0) return;
    
    setAiLoading(true);
    try {
      const recommendation = await aiService.getRecommendation(selectedAsset, chartData);
      setAiRecommendation(recommendation);
    } catch (error) {
      toast.error('Failed to get AI recommendation');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle asset change
  const handleAssetChange = (asset: Asset) => {
    setSelectedAsset(asset);
    setPriceData(null);
    setChartData([]);
    setAiRecommendation(null);
  };

  // Handle trade execution
  const handleExecuteTrade = (action: 'BUY' | 'SELL' | 'HOLD') => {
    setConfirmModal({ isOpen: true, action });
  };

  const confirmTrade = async () => {
    if (!aiRecommendation || !selectedAsset) return;

    try {
      const trade = {
        asset: selectedAsset.symbol,
        action: confirmModal.action,
        ai_recommendation: aiRecommendation.action,
        confidence_score: aiRecommendation.confidence,
        reasoning: aiRecommendation.reasoning,
        timestamp: new Date().toISOString()
      };

      const savedTrade = await tradeService.saveTrade(trade);
      if (savedTrade) {
        toast.success(`${confirmModal.action} order executed successfully!`);
      } else {
        toast.error('Failed to save trade');
      }
    } catch (error) {
      toast.error('Failed to execute trade');
    } finally {
      setConfirmModal({ isOpen: false, action: 'BUY' });
    }
  };

  // Set up intervals
  useEffect(() => {
    fetchPriceData();
    fetchChartData();

    const priceInterval = setInterval(fetchPriceData, UPDATE_INTERVALS.PRICE_UPDATE);
    
    return () => {
      clearInterval(priceInterval);
    };
  }, [selectedAsset]);

  useEffect(() => {
    if (chartData.length > 0) {
      fetchAIRecommendation();
      const aiInterval = setInterval(fetchAIRecommendation, UPDATE_INTERVALS.AI_UPDATE);
      
      return () => {
        clearInterval(aiInterval);
      };
    }
  }, [chartData, selectedAsset]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveChart 
            data={chartData}
            loading={chartLoading}
          />
          <AIAdvicePanel 
            recommendation={aiRecommendation}
            loading={aiLoading}
            onExecuteTrade={handleExecuteTrade}
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