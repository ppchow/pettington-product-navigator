import { Product, DiscountSettings } from '@/types';

export function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(product: Product, settings: DiscountSettings): {
  discountedPrice: string | null;
  discountPercentage: number | null;
} {
  console.log('Calculating discount for:', {
    title: product.title,
    tags: product.tags,
    settings,
    originalPrice: product.originalPrice
  });

  let discountPercentage = null;

  // Check for prescription discount
  if (settings.prescription_enabled && 
      product.tags.some(tag => tag.includes('處方糧'))) {
    discountPercentage = settings.prescription_percentage;
    console.log('Applying prescription discount:', discountPercentage);
  }
  // Check for parasite product discount
  else if (settings.parasite_enabled && 
           product.tags.some(tag => tag.includes('驅蟲除蚤產品'))) {
    discountPercentage = settings.parasite_percentage;
    console.log('Applying parasite discount:', discountPercentage);
  }
  // Check for default discount
  else if (settings.default_enabled) {
    discountPercentage = settings.default_percentage;
    console.log('Applying default discount:', discountPercentage);
  }

  if (!discountPercentage) {
    console.log('No discount applied');
    return {
      discountedPrice: null,
      discountPercentage: null
    };
  }

  // Remove currency symbol and commas before parsing
  const originalPrice = parseFloat(product.originalPrice.replace(/[^0-9.-]+/g, ''));
  const finalPrice = originalPrice * (1 - discountPercentage / 100);

  console.log('Discount calculation:', {
    originalPrice,
    discountPercentage,
    finalPrice,
    formattedPrice: formatPrice(finalPrice)
  });

  return {
    discountedPrice: formatPrice(finalPrice),
    discountPercentage
  };
}
