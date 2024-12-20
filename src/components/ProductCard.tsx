import React from 'react';
import Image from 'next/image';

interface Variant {
  id: string;
  title: string;
  price: string;
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
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{title}</h3>
        
        {variants.length > 0 && (
          <div className="text-xs space-y-1">
            {variants.map((variant) => (
              <div key={variant.id} className="flex justify-between items-center">
                <span className="text-gray-600 line-clamp-1 flex-1">{variant.title}</span>
                <span className={`ml-2 font-medium ${variant.isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                  {variant.price}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
