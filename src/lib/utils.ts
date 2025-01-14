import { Product, DiscountSettings, ProductVariant, PRODUCT_TAGS, DISCOUNT_TYPES } from '@/types';

export function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${price.toFixed(2)}`;
}

export function calculateVariantDiscount(
  variant: { price: string | number },
  tags: string[],
  discountSettings: DiscountSettings | null
): { discountedPrice: string | null; discountPercentage: number } {
  if (!discountSettings) {
    return { discountedPrice: null, discountPercentage: 0 };
  }

  let discountPercentage = 0;
  
  console.log('Calculating discount for tags:', tags);
  console.log('Discount settings:', discountSettings);

  // Apply discount based on tags and settings
  if (discountSettings.prescription_enabled && tags.includes(PRODUCT_TAGS.PRESCRIPTION)) {
    discountPercentage = discountSettings.prescription_percentage;
    console.log('Applied prescription discount:', discountPercentage);
  } else if (discountSettings.parasite_enabled && tags.includes(PRODUCT_TAGS.PARASITE)) {
    discountPercentage = discountSettings.parasite_percentage;
    console.log('Applied parasite discount:', discountPercentage);
  } else if (discountSettings.default_enabled) {
    discountPercentage = discountSettings.default_percentage;
    console.log('Applied default discount:', discountPercentage);
  }

  if (discountPercentage === 0) {
    console.log('No discount applied');
    return { discountedPrice: null, discountPercentage: 0 };
  }

  const price = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price;
  const discountedAmount = price * (1 - discountPercentage / 100);
  
  console.log('Original price:', price);
  console.log('Discounted price:', discountedAmount);

  return {
    discountedPrice: discountedAmount.toString(),
    discountPercentage
  };
}

export function formatPriceRange(min: number | string, max: number | string): string {
  const minFormatted = formatPrice(min);
  const maxFormatted = formatPrice(max);
  return min === max ? minFormatted : `${minFormatted} - ${maxFormatted}`;
}

export const isBrowser = typeof window !== 'undefined';
