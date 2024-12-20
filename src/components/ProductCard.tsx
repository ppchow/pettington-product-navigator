import React, { useState } from 'react';
import Image from 'next/image';
import { Variant, Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-square">
        <Image
          src={product.imageUrl}
          alt={product.imageAltText}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-t-lg"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.title}</h3>
        <p className="text-sm text-gray-500 truncate">{product.vendor}</p>
        
        <div className="mt-2">
          {product.discountedPrice ? (
            <div className="flex flex-col">
              <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">{product.discountedPrice}</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  -{product.discountPercentage}%
                </span>
              </div>
            </div>
          ) : (
            <span className="text-lg font-bold">{product.originalPrice}</span>
          )}
        </div>
        
        {product.variants.length > 0 && (
          <div className="text-xs space-y-1 mt-4">
            {product.variants.map((variant) => (
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
