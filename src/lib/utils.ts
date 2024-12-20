import { Product, DiscountSettings, ProductVariant } from '@/types';

export function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateVariantDiscount(
  variant: ProductVariant,
  productTags: string[],
  settings: DiscountSettings
): {
  discountedPrice: string | null;
  discountPercentage: number | null;
} {
  let discountPercentage = null;

  // Check for prescription discount
  if (settings.prescription_enabled && 
      productTags.some((tag: string) => tag.includes('處方糧'))) {
    discountPercentage = settings.prescription_percentage;
  }
  // Check for parasite product discount
  else if (settings.parasite_enabled && 
           productTags.some((tag: string) => tag.includes('驅蟲除蚤產品'))) {
    discountPercentage = settings.parasite_percentage;
  }
  // Check for default discount
  else if (settings.default_enabled) {
    discountPercentage = settings.default_percentage;
  }

  if (!discountPercentage) {
    return {
      discountedPrice: null,
      discountPercentage: null
    };
  }

  const originalPrice = parseFloat(variant.price);
  const discountedPrice = formatPrice(originalPrice * (1 - discountPercentage / 100));

  return {
    discountedPrice,
    discountPercentage
  };
}
