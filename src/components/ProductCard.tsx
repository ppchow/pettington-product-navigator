import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  
  const mainVariant = product.variants[0];
  if (!mainVariant) return null;

  const imageUrl = mainVariant.image?.url || product.images[0]?.url || '';
  const imageAlt = mainVariant.image?.altText || product.images[0]?.altText || product.title;

  const handleCopySku = (sku: string, event: React.MouseEvent) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    
    // Calculate tooltip position
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });

    // Hide tooltip after 2 seconds
    setTimeout(() => {
      setCopiedSku(null);
      setTooltipPosition(null);
    }, 2000);
  };

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4">
        <div>
          <h3 className="text-sm text-gray-700">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.vendor}</p>
          
          {/* Variants Section */}
          <div className="mt-2 space-y-1">
            {product.variants.map((variant) => (
              <div key={variant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => handleCopySku(variant.sku, e)}
                    className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                  >
                    <p className="text-sm text-gray-500">{variant.sku}</p>
                    <span className="text-gray-400">
                      {copiedSku === variant.sku ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H6zm3 0a1 1 0 000 2h3a1 1 0 100-2H9zm3 0a1 1 0 000 2h.01a1 1 0 100-2H12zm0 3a1 1 0 000 2h.01a1 1 0 100-2H12zm-3 0a1 1 0 000 2h3a1 1 0 100-2H9zm-3 0a1 1 0 000 2h.01a1 1 0 100-2H6z" />
                        </svg>
                      )}
                    </span>
                  </button>
                  {copiedSku === variant.sku && tooltipPosition && (
                    <div 
                      className="absolute left-0 z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm"
                      style={{
                        top: '100%',
                        marginTop: '4px'
                      }}
                    >
                      Copied!
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start sm:items-end space-y-1">
                  {!variant.availableForSale && (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      Not available
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {variant.discountedPrice ? (
                      <>
                        <span className="text-sm line-through text-gray-500">
                          {formatPrice(variant.price)}
                        </span>
                        <span className="text-sm font-medium text-[#4CAF50]">
                          {formatPrice(variant.discountedPrice)}
                        </span>
                        <span className="inline-flex items-center bg-[#4CAF50] px-2 py-0.5 text-xs font-medium text-white rounded-[4px]">
                          -{Math.round(variant.discountPercentage)}%
                        </span>
                      </>
                    ) : variant.compareAtPrice ? (
                      <>
                        <span className="text-sm line-through text-gray-500">
                          {formatPrice(variant.compareAtPrice)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(variant.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(variant.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
