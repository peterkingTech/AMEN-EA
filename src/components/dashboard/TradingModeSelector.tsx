import React from 'react';
import { Settings, Shield, Zap, Brain, FileText } from 'lucide-react';
import { TradingMode } from '../../types';
import { tradingModeService } from '../../services/tradingModeService';

interface TradingModeSelectorProps {
  currentMode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  disabled?: boolean;
}

export const TradingModeSelector: React.FC<TradingModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const modes: { mode: TradingMode; icon: React.ComponentType<any>; description: string }[] = [
    { mode: 'MANUAL', icon: Settings, description: 'Manual - You control all trades' },
    { mode: 'ASSISTED', icon: Brain, description: 'Assisted - AI suggests, you confirm' },
    { mode: 'AUTOPILOT', icon: Zap, description: 'Autopilot - AI executes automatically' },
    { mode: 'HYBRID', icon: Shield, description: 'Hybrid - Auto with risk controls' },
    { mode: 'PAPER', icon: FileText, description: 'Paper - Simulate trades only' }
  ];

  const currentModeData = modes.find(m => m.mode === currentMode);
  const CurrentIcon = currentModeData?.icon || Settings;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3 transition-colors ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-700 cursor-pointer'
        }`}
      >
        <CurrentIcon className={`w-5 h-5 ${tradingModeService.getModeColor(currentMode)}`} />
        <div className="text-left">
          <div className="text-white font-semibold">{currentMode}</div>
          <div className="text-gray-400 text-sm">
            {tradingModeService.formatModeDescription(currentMode)}
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          currentMode === 'AUTOPILOT' ? 'bg-red-500 animate-pulse' :
          currentMode === 'PAPER' ? 'bg-purple-500' :
          currentMode === 'ASSISTED' ? 'bg-green-500' :
          'bg-blue-500'
        }`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-20 min-w-80">
          {modes.map(({ mode, icon: Icon, description }) => (
            <button
              key={mode}
              onClick={() => {
                onModeChange(mode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                mode === currentMode ? 'bg-gray-700' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${tradingModeService.getModeColor(mode)}`} />
              <div className="text-left flex-1">
                <div className="text-white font-semibold">{mode}</div>
                <div className="text-gray-400 text-sm">{description}</div>
              </div>
              {mode === currentMode && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};