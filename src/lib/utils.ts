import { Product, DiscountSettings } from '@/types';

export function calculateDiscount(product: Product, discountSettings: DiscountSettings): {
  discountedPrice: string | null;
  discountPercentage: number | null;
} {
  let discountPercentage: number | null = null;

  // Check for prescription tag and if prescription discount is enabled
  if (discountSettings.prescription_enabled && product.tags.includes('prescription')) {
    discountPercentage = discountSettings.prescription_percentage;
  }
  // Check for parasite product tag and if parasite discount is enabled
  else if (discountSettings.parasite_enabled && product.tags.includes('驅蟲除蚤產品')) {
    discountPercentage = discountSettings.parasite_percentage;
  }
  // Apply default discount if enabled and no other discounts apply
  else if (discountSettings.default_enabled) {
    discountPercentage = discountSettings.default_percentage;
  }

  // If no discount applies or percentage is 0, return null values
  if (!discountPercentage) {
    return {
      discountedPrice: null,
      discountPercentage: null
    };
  }

  const originalPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  const discountAmount = originalPrice * (discountPercentage / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    discountedPrice: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD'
    }).format(finalPrice),
    discountPercentage
  };
}

export function formatPrice(price: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'HKD'
  }).format(typeof price === 'string' ? parseFloat(price) : price);
}
