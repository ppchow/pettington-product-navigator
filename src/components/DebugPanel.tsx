import { useState } from 'react';
import { DiscountSettings } from '@/types';

interface DebugPanelProps {
  discountSettings: DiscountSettings;
}

export default function DebugPanel({ discountSettings }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
      >
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg shadow-xl p-4 text-sm">
          <h3 className="font-bold mb-2">Discount Settings</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">Prescription Products</h4>
              <div className="ml-2">
                <div>Enabled: {discountSettings.prescription_enabled.toString()}</div>
                <div>Percentage: {discountSettings.prescription_percentage}%</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Parasite Products</h4>
              <div className="ml-2">
                <div>Enabled: {discountSettings.parasite_enabled.toString()}</div>
                <div>Percentage: {discountSettings.parasite_percentage}%</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Default Discount</h4>
              <div className="ml-2">
                <div>Enabled: {discountSettings.default_enabled.toString()}</div>
                <div>Percentage: {discountSettings.default_percentage}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
