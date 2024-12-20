import { useEffect, useState } from 'react';
import { getShopifyClient } from '@/lib/shopify';
import ProductGrid from '@/components/ProductGrid';
import Layout from '@/components/Layout';
import FilterSection from '@/components/FilterSection';
import ProductCard from '../components/ProductCard';

interface Collection {
  handle: string;
  title: string;
}

interface Variant {
  id: string;
  title: string;
  price: string;
  isAvailable: boolean;
}

interface Product {
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('prescription-diet-cats-dogs');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);

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

  // Load collections
  useEffect(() => {
    async function loadCollections() {
      try {
        const shopify = getShopifyClient();
        const collectionsData = await shopify.getCollections();
        const filteredCollections = collectionsData.filter((collection: Collection) =>
          allowedCollections.includes(collection.handle)
        );
        setCollections(filteredCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
        setError('Failed to load collections');
      }
    }

    loadCollections();
  }, []);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const shopify = getShopifyClient();
        if (selectedCollection) {
          const productsData = await shopify.getProductsByCollection(selectedCollection);
          const productsWithAvailability = productsData.map((product: Product) => ({
            ...product,
            isAvailable: product.variants.some(variant => variant.isAvailable)
          }));
          setProducts(productsWithAvailability);
          
          // Extract unique vendors
          const vendors = Array.from(new Set(productsData.map((product: Product) => product.vendor))) as string[];
          setAvailableVendors(vendors);
          
          // Initialize filtered products
          setFilteredProducts(productsWithAvailability);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCollection]);

  // Apply filters
  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Apply pet type filter
    if (selectedPetTypes.length > 0) {
      filtered = filtered.filter(product =>
        selectedPetTypes.some(type => product.tags.includes(type))
      );
    }

    // Apply vendor filter
    if (selectedVendors.length > 0) {
      filtered = filtered.filter(product =>
        selectedVendors.includes(product.vendor)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        selectedTags.some(tag => product.tags.includes(tag))
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedVendors, selectedTags, selectedPetTypes]);

  // Handle filter changes
  const handleVendorChange = (vendor: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendor)
        ? prev.filter(v => v !== vendor)
        : [...prev, vendor]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handlePetTypeChange = (type: string) => {
    setSelectedPetTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Handle collection change
  const handleCollectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollection = event.target.value;
    setSelectedCollection(newCollection);
    // Reset all filters when collection changes
    setSelectedVendors([]);
    setSelectedTags([]);
    setSelectedPetTypes([]);
  };

  const predefinedTags = ['tag1', 'tag2', 'tag3'];

  // Determine if vendor filter should be shown
  const showVendorFilter = !['stella-chewys', 'wellness-1'].includes(selectedCollection);

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

        <div className="flex flex-col space-y-4">
          <select
            value={selectedCollection}
            onChange={handleCollectionChange}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {collections.map((collection) => (
              <option key={collection.handle} value={collection.handle}>
                {collection.title}
              </option>
            ))}
          </select>

          <FilterSection
            availableVendors={availableVendors}
            selectedVendors={selectedVendors}
            onVendorSelect={handleVendorChange}
            selectedTags={selectedTags}
            onTagSelect={handleTagChange}
            selectedPetTypes={selectedPetTypes}
            onPetTypeSelect={handlePetTypeChange}
            showVendorFilter={showVendorFilter}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} products
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  imageUrl={product.imageUrl}
                  imageAltText={product.imageAltText}
                  price={product.price}
                  variants={product.variants}
                  isAvailable={product.isAvailable}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
