import { Asset } from '../types';

export const SUPPORTED_ASSETS: Asset[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    type: 'crypto',
    icon: '₿'
  },
  {
    id: 'eth-usdt',
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    type: 'crypto',
    icon: 'Ξ'
  },
  {
    id: 'eur-usd',
    symbol: 'EURUSD',
    name: 'EUR/USD',
    type: 'forex',
    icon: '€'
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    icon: '🍎'
  }
];

export const UPDATE_INTERVALS = {
  PRICE_UPDATE: 5000, // 5 seconds
  AI_UPDATE: 120000   // 2 minutes
};

export const API_ENDPOINTS = {
  BINANCE_TICKER: 'https://api.binance.com/api/v3/ticker/24hr',
  BINANCE_KLINES: 'https://api.binance.com/api/v3/klines',
  TWELVE_DATA_PRICE: 'https://api.twelvedata.com/price',
  TWELVE_DATA_TIME_SERIES: 'https://api.twelvedata.com/time_series'
};