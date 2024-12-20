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
  const response = await shopifyFetch({
    query: `
      query GetDiscountSettings {
        metaobject(handle: "event-discount-settings-8rafyxmo") {
          fields {
            key
            value
          }
        }
      }
    `,
  });

  console.log('Discount settings response:', response);

  if (!response.body?.data?.metaobject?.fields) {
    console.error('No discount settings found:', response);
    return {
      prescription_enabled: false,
      prescription_percentage: 0,
      parasite_enabled: false,
      parasite_percentage: 0,
      default_enabled: false,
      default_percentage: 0,
    };
  }

  const fields = response.body.data.metaobject.fields as MetaobjectField[];
  const settings = {
    prescription_enabled: fields.find(f => f.key === 'prescription_enabled')?.value === 'true',
    prescription_percentage: parseFloat(fields.find(f => f.key === 'prescription_percentage')?.value || '0'),
    parasite_enabled: fields.find(f => f.key === 'parasite_enabled')?.value === 'true',
    parasite_percentage: parseFloat(fields.find(f => f.key === 'parasite_percentage')?.value || '0'),
    default_enabled: fields.find(f => f.key === 'default_enabled')?.value === 'true',
    default_percentage: parseFloat(fields.find(f => f.key === 'default_percentage')?.value || '0'),
  };

  console.log('Parsed discount settings:', settings);
  return settings;
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

      console.log('Collections response:', response); // Debug log

      return response.body?.data?.collections?.edges?.map(
        ({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
        })
      ) || [];
    },

    getProductsByCollection: async (collectionHandle: string): Promise<Product[]> => {
      console.log('Fetching products for collection:', collectionHandle); // Debug log
      
      const response = await shopifyFetch({
        query: `
          query GetProductsByCollection($handle: String!) {
            collection(handle: $handle) {
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
                          priceV2 {
                            amount
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

      console.log('Products response:', response); // Debug log

      const discountSettings = await getDiscountSettings();
      console.log('Discount settings:', discountSettings); // Debug log

      const products = response.body?.data?.collection?.products?.edges?.map(
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
              isAvailable: edge.node.availableForSale
            })),
            discountedPrice: null,
            discountPercentage: null
          };

          const { discountedPrice, discountPercentage } = calculateDiscount(baseProduct, discountSettings);

          return {
            ...baseProduct,
            discountedPrice,
            discountPercentage,
          };
        }
      ) || [];

      console.log('Mapped products:', products); // Debug log
      return products;
    },
  };
}
