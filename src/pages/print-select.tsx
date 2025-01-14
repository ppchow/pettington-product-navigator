import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Product, Collection } from '@/types';
import Layout from '@/components/Layout';
import { getShopifyClient } from '@/lib/shopify';
import { formatPrice } from '@/lib/utils';

interface SelectedVariants {
  [productId: string]: {
    [variantId: string]: boolean;
  };
}

const PrintSelect = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('prescription-diet-cats-dogs');
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showDiscountPrice, setShowDiscountPrice] = useState(true);
  const [showSku, setShowSku] = useState(true);

  // List of allowed collections
  const allowedCollections = [
    'prescription-diet-cats-dogs',
    'pet-supplements',
    'stella-chewys',
    'wellness-1',
    'pet-grooming'
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

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!selectedCollection) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const shopify = getShopifyClient();
        const [collectionsData, productsData] = await Promise.all([
          shopify.getCollections(),
          shopify.getProductsByCollection(selectedCollection)
        ]);

        // Debug log to check product data
        console.log('Loaded products:', productsData);

        // Filter collections
        const filteredCollections = collectionsData.filter((collection: Collection) =>
          allowedCollections.includes(collection.handle)
        );

        // Update states
        setCollections(filteredCollections);
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedCollection, isOnline]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product => {
        // If no tags and vendors selected, show all products
        if (selectedTags.length === 0 && selectedVendors.length === 0) return true;
        
        // Check tag filter
        const passesTagFilter = selectedTags.length === 0 || 
          product.tags.some(productTag => selectedTags.includes(productTag));

        // Check vendor filter
        const passesVendorFilter = selectedVendors.length === 0 || 
          selectedVendors.includes(product.vendor);

        // Product must pass both filters
        return passesTagFilter && passesVendorFilter;
      });
      setFilteredProducts(filtered);
    }
  }, [products, selectedTags, selectedVendors]);

  const handleCollectionSelect = (collection: string) => {
    setSelectedCollection(collection);
    setSelectedVariants({});
    setSelectedTags([]);
    setSelectedVendors([]);
  };

  const handleVariantSelection = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: !prev[productId]?.[variantId]
      }
    }));
  };

  const handleProductSelection = (productId: string) => {
    setSelectedVariants(prev => {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return prev;

      const newState = { ...prev };
      const allVariantsSelected = currentProduct.variants.every(
        variant => prev[productId]?.[variant.id]
      );

      // If all variants are selected, unselect all. Otherwise, select all
      newState[productId] = {};
      if (!allVariantsSelected) {
        currentProduct.variants.forEach(variant => {
          newState[productId][variant.id] = true;
        });
      }

      return newState;
    });
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleVendorSelect = (vendor: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendor)
        ? prev.filter(v => v !== vendor)
        : [...prev, vendor]
    );
  };

  const isProductSelected = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    return product.variants.every(
      variant => selectedVariants[productId]?.[variant.id]
    );
  };

  const handlePrint = () => {
    const selectedProducts = products.map(product => ({
      ...product,
      variants: product.variants
        .filter(variant => selectedVariants[product.id]?.[variant.id])
        .map(variant => ({
          ...variant,
          selected: true
        }))
    })).filter(product => product.variants.length > 0);

    // Include display preferences
    localStorage.setItem('printProducts', JSON.stringify({
      products: selectedProducts,
      showDiscountPrice,
      showSku
    }));
    
    router.push('/print');
  };

  const handleExportDoc = async () => {
    const selectedProducts = products.map(product => ({
      ...product,
      variants: product.variants
        .filter(variant => selectedVariants[product.id]?.[variant.id])
        .map(variant => ({
          ...variant,
          selected: true
        }))
    })).filter(product => product.variants.length > 0);
    
    try {
      const response = await fetch('/api/export-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: selectedProducts,
          showDiscountPrice,
          showSku
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-catalog.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error exporting document:', error);
      alert('Failed to export document');
    }
  };

  const handleExportDocCompact = async () => {
    const selectedProducts = products.map(product => ({
      ...product,
      variants: product.variants
        .filter(variant => selectedVariants[product.id]?.[variant.id])
        .map(variant => ({
          ...variant,
          selected: true
        }))
    })).filter(product => product.variants.length > 0);
    
    try {
      const response = await fetch('/api/export-doc-compact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: selectedProducts,
          showDiscountPrice,
          showSku,
          selectedTags,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-list-compact.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export document. Please try again.');
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedVariants).reduce((total, variants) => 
      total + Object.values(variants).filter(Boolean).length, 0
    );
  };

  // Get unique vendors from products
  const uniqueVendors = [...new Set(products.map(product => product.vendor))].sort();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {!isOnline && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>To https://github.com/ppchow/pettington-product-navigator.git
                   4a2a6f1..fc8cc81  main -> main
                To https://github.com/ppchow/pettington-product-navigator.git
                   fc8cc81..03a2c35  main -> main
                
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
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Select Products for Printing</h1>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDiscountPrice}
                  onChange={(e) => setShowDiscountPrice(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Show Discount Price</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={(e) => setShowSku(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Show SKU</span>
              </label>
            </div>
          </div>
          {getSelectedCount() > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={Object.keys(selectedVariants).length === 0}
              >
                Print Selected
              </button>
              <button
                onClick={handleExportDoc}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!isOnline}
              >
                Export to Word
              </button>
              <button
                onClick={handleExportDocCompact}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={!isOnline}
              >
                Export Compact
              </button>
            </div>
          )}
        </div>

        {/* Collection selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => handleCollectionSelect(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            {collections.map((collection) => (
              <option key={collection.handle} value={collection.handle}>
                {collection.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-4 p-4">
          {/* Tag filter section */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Filter by Tags</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(products.flatMap(p => p.tags))).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1 rounded ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor filter section */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Filter by Vendors</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueVendors.map((vendor) => (
                <button
                  key={vendor}
                  onClick={() => handleVendorSelect(vendor)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedVendors.includes(vendor)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {vendor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{product.title}</h2>
                  <input
                    type="checkbox"
                    checked={isProductSelected(product.id)}
                    onChange={() => handleProductSelection(product.id)}
                    className="w-5 h-5"
                  />
                </div>
                <div className="space-y-2 ml-6">
                  {product.variants.map((variant) => (
                    <div 
                      key={variant.id} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={!!selectedVariants[product.id]?.[variant.id]}
                          onChange={() => handleVariantSelection(product.id, variant.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">{variant.title}</div>
                          <div className="text-sm flex items-center">
                            {variant.discountedPrice && showDiscountPrice && (
                              <span className="line-through text-gray-500 mr-2">
                                {formatPrice(variant.price)}
                              </span>
                            )}
                            <span className={variant.discountedPrice && showDiscountPrice ? 'text-red-600 font-bold' : ''}>
                              {formatPrice(variant.discountedPrice && showDiscountPrice ? variant.discountedPrice : variant.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {variant.sku}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PrintSelect;
