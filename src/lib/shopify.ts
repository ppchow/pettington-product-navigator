import { Product, DiscountSettings } from '@/types';
import { calculateDiscount, formatPrice } from './utils';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const endpoint = `https://${domain}/api/2024-01/graphql.json`;

interface MetaobjectField {
  key: string;
  value: string;
}

async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const response = await result.json();
    
    // Debug logs
    console.log('Shopify API Response:', JSON.stringify(response, null, 2));
    
    if (response.errors) {
      console.error('Shopify API Errors:', response.errors);
      throw new Error(response.errors[0].message);
    }

    return {
      status: result.status,
      body: response,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      error: 'Error receiving data',
    };
  }
}

async function getDiscountSettings(): Promise<DiscountSettings> {
  try {
    // Try to get the specific metaobject by reference
    const response = await shopifyFetch({
      query: `
        query {
          metaobject(id: "gid://shopify/Metaobject/81585340616") {
            id
            handle
            type
            fields {
              key
              value
            }
          }
          metaobjects(type: "event_discount_settings", first: 1) {
            edges {
              node {
                id
                handle
                type
                fields {
                  key
                  value
                }
              }
            }
          }
        }
      `,
    });

    console.log('Full API response:', {
      status: response.status,
      body: response.body,
      error: response.error,
      data: response.body?.data,
      hasMetaobject: !!response.body?.data?.metaobject,
      hasMetaobjects: !!response.body?.data?.metaobjects?.edges?.length
    });

    // Try to get metaobject from either query
    const metaobject = response.body?.data?.metaobject || 
                      response.body?.data?.metaobjects?.edges?.[0]?.node;

    if (metaobject?.fields) {
      const fields = metaobject.fields;
      const settings = fields.reduce((acc: any, field: MetaobjectField) => {
        acc[field.key] = field.value;
        return acc;
      }, {});

      console.log('Raw settings:', settings);

      const parsedSettings = {
        prescription_enabled: settings.prescription_enabled === 'true',
        prescription_percentage: parseFloat(settings.prescription_percentage || '0'),
        parasite_enabled: settings.parasite_enabled === 'true',
        parasite_percentage: parseFloat(settings.parasite_percentage || '0'),
        default_enabled: settings.default_enabled === 'true',
        default_percentage: parseFloat(settings.default_percentage || '0'),
      };

      console.log('Parsed discount settings:', parsedSettings);
      return parsedSettings;
    }

    // If we can't find the metaobject, return default settings
    console.warn('Could not access metaobject data. Using default settings. Please check:');
    console.warn('1. Storefront API token has unauthenticated_read_metaobjects scope');
    console.warn('2. Metaobject type is exactly "event_discount_settings"');
    console.warn('3. Metaobject is published and accessible');
    
    return {
      prescription_enabled: true,
      prescription_percentage: 10,
      parasite_enabled: true,
      parasite_percentage: 10,
      default_enabled: true,
      default_percentage: 5,
    };
  } catch (error) {
    console.error('Error fetching discount settings:', error);
    return {
      prescription_enabled: true,
      prescription_percentage: 10,
      parasite_enabled: true,
      parasite_percentage: 10,
      default_enabled: true,
      default_percentage: 5,
    };
  }
}

export function getShopifyClient() {
  return {
    getCollections: async () => {
      const response = await shopifyFetch({
        query: `
          query GetCollections {
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
        `,
      });

      console.log('Collections response:', response);
      return response.body?.data?.collections?.edges?.map(
        ({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
        })
      ) || [];
    },

    getProductsByCollection: async (collectionHandle: string): Promise<Product[]> => {
      console.log('Fetching products for collection:', collectionHandle);
      
      // First fetch discount settings
      const discountSettings = await getDiscountSettings();
      console.log('Fetched discount settings:', discountSettings);

      // Then fetch products
      const response = await shopifyFetch({
        query: `
          query GetProductsByCollection($handle: String!) {
            collection(handle: $handle) {
              handle
              title
              products(first: 250) {
                edges {
                  node {
                    id
                    handle
                    title
                    description
                    vendor
                    tags
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                    variants(first: 100) {
                      edges {
                        node {
                          id
                          title
                          sku
                          priceV2 {
                            amount
                            currencyCode
                          }
                          availableForSale
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          handle: collectionHandle,
        },
      });

      console.log('Products API response:', JSON.stringify(response, null, 2));

      if (!response.body?.data?.collection?.products?.edges) {
        console.error('No products found in response:', response);
        return [];
      }

      const products = response.body.data.collection.products.edges.map(
        ({ node }: any): Product => {
          const price = formatPrice(node.priceRange.minVariantPrice.amount);
          const baseProduct = {
            id: node.id,
            handle: node.handle,
            title: node.title,
            description: node.description,
            vendor: node.vendor,
            tags: node.tags,
            price,
            originalPrice: price,
            imageUrl: node.images.edges[0]?.node.url || '',
            imageAltText: node.images.edges[0]?.node.altText || node.title,
            collection: collectionHandle,
            variants: node.variants?.edges?.map((edge: any) => ({
              id: edge.node.id,
              title: edge.node.title,
              price: formatPrice(edge.node.priceV2.amount),
              isAvailable: edge.node.availableForSale,
              sku: edge.node.sku || ''
            })),
            discountedPrice: null,
            discountPercentage: null
          };

          const { discountedPrice, discountPercentage } = calculateDiscount(baseProduct, discountSettings);
          console.log('Product discount calculation:', {
            title: baseProduct.title,
            tags: baseProduct.tags,
            originalPrice: baseProduct.price,
            discountedPrice,
            discountPercentage
          });

          return {
            ...baseProduct,
            discountedPrice,
            discountPercentage,
          };
        }
      );

      console.log('Processed products:', products.map((p: Product) => ({
        title: p.title,
        tags: p.tags,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        discountPercentage: p.discountPercentage
      })));

      return products;
    },
  };
}
