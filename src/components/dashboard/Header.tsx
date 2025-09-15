import React from 'react';
import { TrendingUp, User, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AMEN Expert Advisor</h1>
              <p className="text-gray-400 text-sm">AI Trading Advisor</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-white">User</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                <button className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Profile</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-700 transition-colors last:rounded-b-lg">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};