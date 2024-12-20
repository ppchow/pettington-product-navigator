export interface Variant {
  id: string;
  title: string;
  price: string;
  sku: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  tags: string[];
  price: string;
  imageUrl: string;
  imageAltText: string;
  collection: string;
  variants: Variant[];
  isAvailable: boolean;
}
