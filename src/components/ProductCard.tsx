import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopySku = async (sku: string) => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
      console.log('Copied SKU:', sku); // Debug log
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
        
        {product.variants && product.variants.length > 0 && (
          <div className="text-xs space-y-1 mt-4">
            {product.variants.map((variant) => (
              <div key={variant.id} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{variant.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{variant.sku}</span>
                    <button
                      onClick={() => handleCopySku(variant.sku)}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                    >
                      {copiedSku === variant.sku ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={variant.isAvailable ? 'text-green-600' : 'text-red-600'}>
                    {variant.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="font-medium">{variant.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
