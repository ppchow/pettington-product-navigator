export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: string;
  availableForSale: boolean;
  compareAtPrice?: string | null;
  discountedPrice?: string | null;
  discountPercentage?: number | null;
}

export interface DiscountSettings {
  prescription_enabled: boolean;
  prescription_percentage: number;
  parasite_enabled: boolean;
  parasite_percentage: number;
  default_enabled: boolean;
  default_percentage: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  images: {
    url: string;
    altText: string | null;
  }[];
  variants: ProductVariant[];
  vendor: string;
  collection?: string;
}
