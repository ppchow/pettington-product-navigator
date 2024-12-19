import React from 'react';
import type { ProductType } from '@/lib/db';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  vendor: string;
  imageUrl: string;
  imageAltText: string;
  variants: Array<{
    id: string;
    price: string;
    weight: number;
    available: boolean;
  }>;
}

interface ProductGridProps {
  products: ProductType[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative w-full h-64">
            <Image
              src={product.imageUrl}
              alt={product.imageAltText || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              priority={products.indexOf(product) < 4} // Add priority for first 4 images
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.vendor}</p>
            {product.variants && product.variants.length > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-blue-600">
                  {product.variants[0].price}
                </p>
                <span className={`px-2 py-1 text-sm rounded ${
                  product.variants[0].available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.variants[0].available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
