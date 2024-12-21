export interface Collection {
  id: string;
  handle: string;
  title: string;
}

export interface DiscountSettings {
  prescription_enabled: boolean;
  prescription_percentage: number;
  parasite_enabled: boolean;
  parasite_percentage: number;
  default_enabled: boolean;
  default_percentage: number;
  lastUpdated: number; // timestamp for cache validation
}

export interface MetaobjectField {
  key: string;
  value: string;
}

export interface DiscountMetaobject {
  fields: MetaobjectField[];
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  availableForSale: boolean;
  image: ProductImage | null;
  selectedOptions: SelectedOption[];
  discountedPrice: string | null;
  discountPercentage: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  vendor: string;
  collection: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

// Product tag constants
export const PRODUCT_TAGS = {
  PRESCRIPTION: '處方糧',
  PARASITE: '驅蟲除蚤產品'
} as const;

// Discount types
export const DISCOUNT_TYPES = {
  PRESCRIPTION: 'prescription',
  PARASITE: 'parasite',
  DEFAULT: 'default'
} as const;
