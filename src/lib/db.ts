import { openDB, DBSchema, IDBKeyRange } from 'idb';

interface ProductType {
  id: string;
  title: string;
  vendor: string;
  collection: string;
  tags: string[];
  variants: {
    id: string;
    weight: number;
    price: string;
    available: boolean;
  }[];
  imageUrl: string;
}

interface ShopifyDBSchema extends DBSchema {
  products: {
    key: string;
    value: ProductType;
    indexes: {
      'by-collection': string;
      'by-vendor': string;
      'by-tags': string[];
    };
  };
}

const DB_NAME = 'shopify-product-navigator';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB<ShopifyDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const productStore = db.createObjectStore('products', { keyPath: 'id' });
      productStore.createIndex('by-collection', 'collection');
      productStore.createIndex('by-vendor', 'vendor');
      productStore.createIndex('by-tags', 'tags', { multiEntry: true });
    },
  });
  return db;
}

export async function storeProducts(products: ProductType[]) {
  const db = await initDB();
  const tx = db.transaction('products', 'readwrite');
  await Promise.all(products.map(product => tx.store.put(product)));
  await tx.done;
}

export async function getProductsByCollection(collection: string) {
  const db = await initDB();
  return db.getAllFromIndex('products', 'by-collection', collection);
}

export async function getProductsByVendor(vendor: string) {
  const db = await initDB();
  return db.getAllFromIndex('products', 'by-vendor', vendor);
}

export async function getProductsByTag(tag: string) {
  const db = await initDB();
  const products = await db.getAllFromIndex('products', 'by-tags', IDBKeyRange.only(tag));
  return products;
}

export async function getAllProducts() {
  const db = await initDB();
  return db.getAll('products');
}

export type { ProductType };
