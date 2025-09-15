import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Asset } from '../../types';
import { SUPPORTED_ASSETS } from '../../config/constants';

interface AssetSelectorProps {
  selectedAsset: Asset;
  onAssetChange: (asset: Asset) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  onAssetChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3 hover:bg-gray-700 transition-colors"
      >
        <span className="text-2xl">{selectedAsset.icon}</span>
        <div className="text-left">
          <div className="text-white font-semibold">{selectedAsset.name}</div>
          <div className="text-gray-400 text-sm">{selectedAsset.symbol}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-10">
          {SUPPORTED_ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => {
                onAssetChange(asset);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="text-2xl">{asset.icon}</span>
              <div className="text-left">
                <div className="text-white font-semibold">{asset.name}</div>
                <div className="text-gray-400 text-sm">{asset.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};