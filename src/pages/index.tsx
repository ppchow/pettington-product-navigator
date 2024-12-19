import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { getShopifyClient } from '@/lib/shopify';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<Array<{ handle: string; title: string }>>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('prescription-diet-cats-dogs');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // List of allowed collections
  const allowedCollections = [
    'prescription-diet-cats-dogs',
    'pet-supplements',
    'stella-chewys',
    'wellness-1'
  ];

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    async function loadCollections() {
      try {
        const shopify = getShopifyClient();
        const collectionsData = await shopify.getCollections();
        // Filter collections to only include allowed ones
        const filteredCollections = collectionsData.filter(collection => 
          allowedCollections.includes(collection.handle)
        );
        console.log('Filtered collections:', filteredCollections);
        setCollections(filteredCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
        setError('Failed to load collections');
      }
    }

    loadCollections();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const shopify = getShopifyClient();
        console.log('Loading products for collection:', selectedCollection);
        const productsData = await shopify.getProductsByCollection(selectedCollection);
        console.log('Products loaded:', productsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedCollection) {
      loadProducts();
    }
  }, [selectedCollection]);

  // Sort products by weight
  const sortedProducts = [...products].sort((a, b) => {
    const aWeight = Math.min(...(a.variants?.map((v: any) => v.weight) || [0]));
    const bWeight = Math.min(...(b.variants?.map((v: any) => v.weight) || [0]));
    return aWeight - bWeight;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {!isOnline && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are currently offline. Showing cached products.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            {collections.map((collection) => (
              <option key={collection.handle} value={collection.handle}>
                {collection.title}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ProductGrid products={sortedProducts} />
        )}
      </div>
    </Layout>
  );
}
