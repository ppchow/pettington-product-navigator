export interface Variant {
  id: string;
  title: string;
  price: string;
  isAvailable: boolean;
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
  handle: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  price: string;
  originalPrice: string;
  discountedPrice: string | null;
  discountPercentage: number | null;
  imageUrl: string;
  imageAltText: string;
  collection: string;
  variants?: Variant[];
}
