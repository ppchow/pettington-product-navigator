import React, { useState } from 'react';
import Image from 'next/image';

interface Variant {
  id: string;
  title: string;
  price: string;
  sku: string;
  isAvailable: boolean;
}

interface ProductCardProps {
  title: string;
  imageUrl: string;
  imageAltText: string;
  price: string;
  variants: Variant[];
  isAvailable: boolean;
}

export default function ProductCard({
  title,
  imageUrl,
  imageAltText,
  price,
  variants,
  isAvailable,
}: ProductCardProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopySku = async (sku: string) => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy SKU:', err);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="aspect-square relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAltText}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Not available
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        
        {variants.length > 0 && (
          <div className="text-xs space-y-1">
            {variants.map((variant) => (
              <div key={variant.id} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{variant.title}</span>
                  <span className={`ml-2 font-medium ${variant.isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                    {variant.price}
                  </span>
                </div>
                {variant.sku && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">SKU:</span>
                    <button
                      onClick={() => handleCopySku(variant.sku)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <span>{variant.sku}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                      </svg>
                      {copiedSku === variant.sku && (
                        <span className="text-green-600 text-xs">Copied!</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
