import React, { useState } from 'react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const mainVariant = product.variants[0];
  if (!mainVariant) return null;

  const imageUrl = mainVariant.image?.url || product.images[0]?.url || '';
  const imageAlt = mainVariant.image?.altText || product.images[0]?.altText || product.title;

  const handleCopySku = async (sku: string) => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);

      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setCopiedSku(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80">
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          style={{ aspectRatio: '1 / 1' }}
        />
      </div>
      <div className="mt-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.vendor}</p>

          {/* Variants Section */}
          <div className="mt-3 divide-y divide-gray-100">
            {product.variants.map((variant) => (
              <div key={variant.id} className="py-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCopySku(variant.sku)}
                        className="group inline-flex items-center space-x-1 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors shrink-0 relative"
                      >
                        <p className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{variant.sku}</p>
                        <span className="text-gray-400">
                          {copiedSku === variant.sku ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H6zm3 0a1 1 0 000 2h3a1 1 0 100-2H9zm3 0a1 1 0 000 2h.01a1 1 0 100-2H12zm0 3a1 1 0 000 2h.01a1 1 0 100-2H12zm-3 0a1 1 0 000 2h3a1 1 0 100-2H9zm-3 0a1 1 0 000 2h.01a1 1 0 100-2H6z" />
                            </svg>
                          )}
                        </span>
                        {copiedSku === variant.sku && (
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap"
                          >
                            Copied!
                          </div>
                        )}
                      </button>
                    </div>
                    {variant.title !== 'Default Title' && (
                      <p className="mt-0.5 text-xs text-gray-500 truncate pl-1.5">{variant.title}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end mt-1.5 sm:mt-0">
                    <div className="flex items-center space-x-2">
                      {!variant.availableForSale && (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Not available
                        </span>
                      )}
                      <div className="flex items-center space-x-1.5">
                        {variant.discountedPrice ? (
                          <>
                            <span className="text-xs line-through text-gray-400">
                              {formatPrice(variant.price)}
                            </span>
                            <span className="text-sm font-medium text-[#4CAF50]">
                              {formatPrice(variant.discountedPrice)}
                            </span>
                            <span className="inline-flex items-center bg-[#4CAF50] px-1.5 py-0.5 text-xs font-medium text-white rounded">
                              -{Math.round(variant.discountPercentage)}%
                            </span>
                          </>
                        ) : variant.compareAtPrice ? (
                          <>
                            <span className="text-xs line-through text-gray-400">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
