import { Product, DiscountSettings, MetaobjectField, DiscountMetaobject, PRODUCT_TAGS } from '@/types';

// Constants for discount settings
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEFAULT_DISCOUNT_SETTINGS: DiscountSettings = {
  prescription_enabled: false,
  prescription_percentage: 0,
  parasite_enabled: false,
  parasite_percentage: 0,
  default_enabled: false,
  default_percentage: 0,
  lastUpdated: 0
};

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN!;

async function shopifyFetch<T>(query: string): Promise<T> {
  try {
    if (!navigator.onLine) {
      throw new Error('Offline');
    }

    console.log('Making Shopify API request with query:', query);

    const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log('Shopify API Response:', json);

    if (json.errors) {
      console.error('GraphQL Error:', json.errors);
      throw new Error(json.errors[0].message);
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof Error && error.message === 'Offline') {
      throw error;
    }
    console.error('Error fetching from Shopify API:', error);
    throw error;
  }
}

function parseMetaobjectField(fields: MetaobjectField[], key: string, type: 'boolean' | 'number' = 'boolean'): any {
  const field = fields.find(f => f.key === key);
  if (!field) {
    console.warn(`Field ${key} not found in metaobject`);
    return type === 'boolean' ? false : 0;
  }
  
  if (type === 'boolean') {
    return field.value.toLowerCase() === 'true';
  } else {
    const value = parseFloat(field.value);
    if (isNaN(value)) {
      console.warn(`Invalid number value for ${key}: ${field.value}`);
      return 0;
    }
    return Math.min(Math.max(value, 0), 100); // Ensure percentage is between 0-100
  }
}

function parseDiscountMetaobject(metaobject: DiscountMetaobject): DiscountSettings {
  console.log('Parsing metaobject fields:', metaobject.fields);
  const fields = metaobject.fields;
  
  return {
    prescription_enabled: parseMetaobjectField(fields, 'prescription_enabled', 'boolean'),
    prescription_percentage: parseMetaobjectField(fields, 'prescription_percentage', 'number'),
    parasite_enabled: parseMetaobjectField(fields, 'parasite_enabled', 'boolean'),
    parasite_percentage: parseMetaobjectField(fields, 'parasite_percentage', 'number'),
    default_enabled: parseMetaobjectField(fields, 'default_enabled', 'boolean'),
    default_percentage: parseMetaobjectField(fields, 'default_percentage', 'number'),
    lastUpdated: Date.now()
  };
}

function calculateVariantDiscount(variant: { price: number }, tags: string[], discountSettings: DiscountSettings) {
  let discountedPrice = null;
  let discountPercentage = 0;

  console.log('=== Discount Calculation Debug ===');
  console.log('Product tags:', tags);
  console.log('Discount settings:', discountSettings);
  console.log('Original price:', variant.price);
  console.log(`Looking for prescription tag: ${PRODUCT_TAGS.PRESCRIPTION}`);
  console.log(`Looking for parasite tag: ${PRODUCT_TAGS.PARASITE}`);

  // Apply discounts based on product tags
  if (discountSettings) {
    if (discountSettings.prescription_enabled && tags.includes(PRODUCT_TAGS.PRESCRIPTION)) {
      discountPercentage = discountSettings.prescription_percentage;
      console.log('✓ Applied prescription discount:', discountPercentage);
    } else if (discountSettings.parasite_enabled && tags.includes(PRODUCT_TAGS.PARASITE)) {
      discountPercentage = discountSettings.parasite_percentage;
      console.log('✓ Applied parasite discount:', discountPercentage);
    } else if (discountSettings.default_enabled) {
      discountPercentage = discountSettings.default_percentage;
      console.log('✓ Applied default discount:', discountPercentage);
    } else {
      console.log('✗ No discount conditions met');
    }

    if (discountPercentage > 0) {
      discountedPrice = variant.price * (1 - discountPercentage / 100);
      console.log('Final discounted price:', discountedPrice);
    }
  } else {
    console.log('✗ No discount settings available');
  }

  console.log('=== End Discount Calculation ===');
  return { discountedPrice, discountPercentage };
}

export function getShopifyClient() {
  const getDiscountSettings = async (): Promise<DiscountSettings> => {
    try {
      // Check cache first
      const cachedSettings = localStorage.getItem('discount_settings');
      if (cachedSettings) {
        const settings = JSON.parse(cachedSettings) as DiscountSettings;
        // Check if cache is still valid (not expired)
        if (settings.lastUpdated && Date.now() - settings.lastUpdated < CACHE_EXPIRY) {
          console.log('Using cached discount settings:', settings);
          return settings;
        }
      }

      if (!navigator.onLine) {
        console.log('Offline mode - using cached or default settings');
        return cachedSettings ? JSON.parse(cachedSettings) : DEFAULT_DISCOUNT_SETTINGS;
      }

      console.log('Fetching discount settings from Shopify...');
      const data = await shopifyFetch<any>(`
        query {
          metaobject(id: "gid://shopify/Metaobject/81585340616") {
            fields {
              key
              value
            }
          }
        }
      `);

      console.log('Raw metaobject data:', data);

      if (!data?.metaobject?.fields) {
        console.warn('No discount settings found in metaobject, using defaults');
        return DEFAULT_DISCOUNT_SETTINGS;
      }

      const settings = parseDiscountMetaobject({ fields: data.metaobject.fields });
      console.log('Parsed discount settings:', settings);

      // Cache the settings with timestamp
      localStorage.setItem('discount_settings', JSON.stringify(settings));
      return settings;

    } catch (error) {
      console.error('Error fetching discount settings:', error);
      // On error, try to use cached settings regardless of expiry
      const cachedSettings = localStorage.getItem('discount_settings');
      if (cachedSettings) {
        const settings = JSON.parse(cachedSettings);
        console.log('Using cached settings after error:', settings);
        return settings;
      }
      console.log('Using default settings after error');
      return DEFAULT_DISCOUNT_SETTINGS;
    }
  };

  const getProductsByCollection = async (collectionHandle: string): Promise<Product[]> => {
    try {
      if (!navigator.onLine) {
        const cachedProducts = localStorage.getItem(`products_${collectionHandle}`);
        if (cachedProducts) {
          return JSON.parse(cachedProducts);
        }
        throw new Error('No cached products available offline');
      }

      const discountSettings = await getDiscountSettings();
      const data = await shopifyFetch<any>(`
        query {
          collection(handle: "${collectionHandle}") {
            products(first: 250) {
              edges {
                node {
                  id
                  title
                  vendor
                  tags
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 250) {
                    edges {
                      node {
                        id
                        sku
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        compareAtPriceV2 {
                          amount
                          currencyCode
                        }
                        availableForSale
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `);

      if (!data?.collection?.products?.edges) {
        throw new Error('No products found in collection');
      }

      const products = data.collection.products.edges.map((edge: any) => {
        const product = edge.node;
        return {
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          tags: product.tags,
          images: product.images.edges.map((imgEdge: any) => ({
            url: imgEdge.node.url,
            altText: imgEdge.node.altText,
          })),
          variants: product.variants.edges.map((variantEdge: any) => {
            const variant = variantEdge.node;
            const price = parseFloat(variant.priceV2.amount);
            const compareAtPrice = variant.compareAtPriceV2 
              ? parseFloat(variant.compareAtPriceV2.amount)
              : null;

            // Calculate discount using the utility function
            const { discountedPrice, discountPercentage } = calculateVariantDiscount(
              { price },
              product.tags,
              discountSettings
            );

            console.log('Product:', {
              title: product.title,
              tags: product.tags,
              price,
              discountedPrice,
              discountPercentage
            });

            return {
              id: variant.id,
              sku: variant.sku,
              title: variant.title,
              price,
              compareAtPrice,
              discountedPrice: discountedPrice !== null ? discountedPrice.toString() : null,
              discountPercentage,
              availableForSale: variant.availableForSale,
              image: variant.image ? {
                url: variant.image.url,
                altText: variant.image.altText,
              } : null,
            };
          }),
        };
      });

      // Cache the products
      localStorage.setItem(`products_${collectionHandle}`, JSON.stringify(products));
      return products;
    } catch (error) {
      if (error instanceof Error && error.message === 'Offline') {
        const cachedProducts = localStorage.getItem(`products_${collectionHandle}`);
        if (cachedProducts) {
          return JSON.parse(cachedProducts);
        }
      }
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  const getCollections = async () => {
    try {
      if (!navigator.onLine) {
        const cachedCollections = localStorage.getItem('collections');
        if (cachedCollections) {
          return JSON.parse(cachedCollections);
        }
        throw new Error('No cached collections available offline');
      }

      const data = await shopifyFetch<any>(`
        query {
          collections(first: 250) {
            edges {
              node {
                id
                handle
                title
              }
            }
          }
        }
      `);

      if (!data?.collections?.edges) {
        throw new Error('No collections found');
      }

      const collections = data.collections.edges.map((edge: any) => ({
        id: edge.node.id,
        handle: edge.node.handle,
        title: edge.node.title,
      }));

      // Cache the collections
      localStorage.setItem('collections', JSON.stringify(collections));
      return collections;
    } catch (error) {
      if (error instanceof Error && error.message === 'Offline') {
        const cachedCollections = localStorage.getItem('collections');
        if (cachedCollections) {
          return JSON.parse(cachedCollections);
        }
      }
      console.error('Error fetching collections:', error);
      throw error;
    }
  };

  return {
    getProductsByCollection,
    getCollections,
    getDiscountSettings,
  };
}
