import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const imageUrl = product.images[0]?.url || '';
  const imageAlt = product.images[0]?.altText || product.title;

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover object-center"
          width={300}
          height={300}
        />
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-gray-700">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.vendor}</p>
      </div>
      <div className="mt-2">
        {product.variants.map((variant) => (
          <div key={variant.id} className="mb-2">
            <div className="flex items-center justify-between">
              {variant.title !== 'Default Title' && (
                <p className="text-sm text-gray-500">{variant.title}</p>
              )}
              {variant.sku && (
                <div className="relative">
                  <button
                    onClick={() => handleCopySku(variant.sku)}
                    className="text-sm text-blue-600 flex items-center hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <span className="mr-1">SKU: {variant.sku}</span>
                    <span className="text-blue-500 hover:text-blue-600">📋</span>
                  </button>
                  {copiedSku === variant.sku && (
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                      SKU copied!
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {variant.discountedPrice ? (
                <>
                  <p className="text-sm text-gray-900 line-through">{variant.price}</p>
                  <p className="ml-2 text-sm text-red-600">{variant.discountedPrice}</p>
                  <span className="ml-2 text-sm text-red-600">
                    (-{variant.discountPercentage}%)
                  </span>
                </>
              ) : (
                <p className="text-sm text-gray-900">{variant.price}</p>
              )}
              {!variant.availableForSale && (
                <span className="ml-2 text-sm text-red-600">Not available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
