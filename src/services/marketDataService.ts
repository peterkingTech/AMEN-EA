import { PriceData, ChartData, Asset } from '../types';
import { API_ENDPOINTS } from '../config/constants';

class MarketDataService {
  private async fetchBinancePrice(symbol: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`${API_ENDPOINTS.BINANCE_TICKER}?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch Binance data');
      
      const data = await response.json();
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChange),
        changePercent24h: parseFloat(data.priceChangePercent),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      return null;
    }
  }

  private async fetchTwelveDataPrice(symbol: string): Promise<PriceData | null> {
    try {
      const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;
      const response = await fetch(
        `${API_ENDPOINTS.TWELVE_DATA_PRICE}?symbol=${symbol}&apikey=${apiKey}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch Twelve Data');
      
      const data = await response.json();
      
      // For demo purposes, generate mock change data
      const mockChange = (Math.random() - 0.5) * 10;
      const mockChangePercent = (Math.random() - 0.5) * 5;
      
      return {
        symbol: symbol,
        price: parseFloat(data.price),
        change24h: mockChange,
        changePercent24h: mockChangePercent,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching Twelve Data price:', error);
      return null;
    }
  }

  async getPrice(asset: Asset): Promise<PriceData | null> {
    if (asset.type === 'crypto') {
      return this.fetchBinancePrice(asset.symbol);
    } else {
      return this.fetchTwelveDataPrice(asset.symbol);
    }
  }

  async getChartData(asset: Asset, interval = '1h', limit = 50): Promise<ChartData[]> {
    try {
      if (asset.type === 'crypto') {
        const response = await fetch(
          `${API_ENDPOINTS.BINANCE_KLINES}?symbol=${asset.symbol}&interval=${interval}&limit=${limit}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch chart data');
        
        const data = await response.json();
        return data.map((candle: any[]) => ({
          time: candle[0],
          price: parseFloat(candle[4]) // Close price
        }));
      } else {
        // Generate mock data for forex/stocks (replace with real Twelve Data implementation)
        const mockData: ChartData[] = [];
        const basePrice = 100 + Math.random() * 1000;
        const now = Date.now();
        
        for (let i = limit - 1; i >= 0; i--) {
          mockData.push({
            time: now - (i * 3600000), // 1 hour intervals
            price: basePrice + (Math.random() - 0.5) * 50
          });
        }
        
        return mockData;
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  }

  // Mock real-time price updates for demo
  generateMockPriceUpdate(currentPrice: number): PriceData {
    const change = (Math.random() - 0.5) * (currentPrice * 0.02);
    const newPrice = currentPrice + change;
    
    return {
      symbol: 'MOCK',
      price: newPrice,
      change24h: change,
      changePercent24h: (change / currentPrice) * 100,
      timestamp: Date.now()
    };
  }
}

export const marketDataService = new MarketDataService();