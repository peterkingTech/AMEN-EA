import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BarChart3, History, Cross } from 'lucide-react';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { EnhancedTradeHistory } from './components/tradeHistory/EnhancedTradeHistory';

type ActiveTab = 'dashboard' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            border: '1px solid #374151'
          }
        }}
      />
      
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AMEN Expert Advisor</h1>
                <p className="text-gray-400 text-sm">Christian AI Trading Platform</p>
              </div>
            </div>
            
            <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              } transition-colors`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              } transition-colors`}
            >
              <History className="w-4 h-4" />
              <span>Trade History</span>
            </button>
          </div>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'dashboard' && <EnhancedDashboard />}
        {activeTab === 'history' && <EnhancedTradeHistory />}
      </main>
    </div>
  );
}

export default App;