import { Product, DiscountSettings } from '@/types';
import { calculateDiscount, formatPrice } from './utils';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

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

    return {
      status: result.status,
      body: await result.json(),
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
        metaobject(handle: "event_discount_settings") {
          fields {
            key
            value
          }
        }
      }
    `,
  });
  
  const fields = response.body.data.metaobject.fields;
  return {
    prescription_enabled: fields.find(f => f.key === 'prescription_enabled').value === 'true',
    prescription_percentage: parseFloat(fields.find(f => f.key === 'prescription_percentage').value),
    parasite_enabled: fields.find(f => f.key === 'parasite_enabled').value === 'true',
    parasite_percentage: parseFloat(fields.find(f => f.key === 'parasite_percentage').value),
    default_enabled: fields.find(f => f.key === 'default_enabled').value === 'true',
    default_percentage: parseFloat(fields.find(f => f.key === 'default_percentage').value),
  };
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

      console.log('Raw API Response:', JSON.stringify(response.body?.data, null, 2));

      const collections = response.body?.data?.collections?.edges?.map(
        ({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
        })
      );

      console.log('Mapped Collections:', collections);

      return collections || [];
    },

    getProductsByCollection: async (collectionHandle: string) => {
      const response = await shopifyFetch({
        query: `
          query GetProductsByCollection($handle: String!) {
            collection(handle: $handle) {
              handle
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    tags
                    vendor
                    availableForSale
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
                    variants(first: 250) {
                      edges {
                        node {
                          id
                          title
                          sku
                          availableForSale
                          price {
                            amount
                            currencyCode
                          }
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

      const products = response.body?.data?.collection?.products?.edges?.map(
        ({ node }: any): Product => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          vendor: node.vendor,
          tags: node.tags,
          price: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: node.priceRange.minVariantPrice.currencyCode,
          }).format(node.priceRange.minVariantPrice.amount),
          imageUrl: node.images.edges[0]?.node.url || '',
          imageAltText: node.images.edges[0]?.node.altText || node.title,
          collection: response.body?.data?.collection?.handle || collectionHandle,
          variants: node.variants.edges.map((edge: any) => ({
            id: edge.node.id,
            title: edge.node.title || '',
            sku: edge.node.sku || '',
            price: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: edge.node.price.currencyCode,
            }).format(edge.node.price.amount),
            isAvailable: edge.node.availableForSale
          })),
          isAvailable: node.availableForSale
        })
      );

      return products || [];
    },

    getProductsByCollectionWithDiscounts: async (collectionHandle: string) => {
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
                    tags
                    vendor
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

      const discountSettings = await getDiscountSettings();

      return response.body?.data?.collection?.products?.edges?.map(
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
            images: node.images.edges.map((edge: any) => edge.node.url),
            imageUrl: node.images.edges[0]?.node.url || '',
            imageAltText: node.images.edges[0]?.node.altText || node.title,
            collection: collectionHandle,
          };

          const { discountedPrice, discountPercentage } = calculateDiscount(baseProduct, discountSettings);

          return {
            ...baseProduct,
            discountedPrice,
            discountPercentage,
          };
        }
      ) || [];
    },
  };
}
