import React, { useState } from 'react';
import { getDiscountSettings } from '@/lib/shopify';
import { DiscountSettings } from '@/types';

interface DebugPanelProps {
  discountSettings?: DiscountSettings;
}

export default function DebugPanel({ discountSettings: propDiscountSettings }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debugDiscountSettings, setDebugDiscountSettings] = useState<DiscountSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDiscountSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getDiscountSettings();
      setDebugDiscountSettings(settings);
      console.log('Discount settings:', settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching discount settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
      >
        {isOpen ? 'Close Debug' : 'Open Debug'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Debug Panel</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Discount Settings:</h4>
              {propDiscountSettings ? (
                <div className="text-sm space-y-1">
                  <div>
                    <div>Prescription:</div>
                    <div>Enabled: {propDiscountSettings.prescription_enabled ? 'Yes' : 'No'}</div>
                    <div>Percentage: {propDiscountSettings.prescription_percentage}%</div>
                  </div>
                  <div>
                    <div>Parasite:</div>
                    <div>Enabled: {propDiscountSettings.parasite_enabled ? 'Yes' : 'No'}</div>
                    <div>Percentage: {propDiscountSettings.parasite_percentage}%</div>
                  </div>
                  <div>
                    <div>Default:</div>
                    <div>Enabled: {propDiscountSettings.default_enabled ? 'Yes' : 'No'}</div>
                    <div>Percentage: {propDiscountSettings.default_percentage}%</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No settings loaded</div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Test Admin API:</h4>
              <button
                onClick={testDiscountSettings}
                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Discount Settings'}
              </button>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  Error: {error}
                </div>
              )}

              {debugDiscountSettings && (
                <div className="text-sm mt-2">
                  <h4 className="font-medium">API Response:</h4>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                    {JSON.stringify(debugDiscountSettings, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
