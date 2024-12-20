import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0]?.url || '';
  const imageAlt = product.images[0]?.altText || product.title;

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
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.vendor}</p>
        </div>
      </div>
      <div className="mt-2">
        {product.variants.map((variant) => (
          <div key={variant.id} className="mb-2">
            <div className="flex items-center justify-between">
              {variant.title !== 'Default Title' && (
                <p className="text-sm text-gray-500">{variant.title}</p>
              )}
              {variant.sku && (
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="mr-1">SKU: {variant.sku}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(variant.sku)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    📋
                  </button>
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
