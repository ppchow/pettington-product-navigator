import { Product, ProductVariant, DiscountSettings } from '@/types';
import { formatPrice, calculateVariantDiscount } from '@/lib/utils';

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
    const response = await shopifyFetch({
      query: `
        query GetDiscountSettings {
          metaobjects(type: "event_discount_settings", first: 1) {
            edges {
              node {
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

    const metaobject = response.body?.data?.metaobjects?.edges?.[0]?.node;
    
    if (!metaobject?.fields) {
      console.error('No discount settings found in metaobject');
      return {
        prescription_enabled: false,
        prescription_percentage: 0,
        parasite_enabled: false,
        parasite_percentage: 0,
        default_enabled: false,
        default_percentage: 0,
      };
    }

    const fields = metaobject.fields as MetaobjectField[];
    return {
      prescription_enabled: fields.find(f => f.key === 'prescription_enabled')?.value === 'true',
      prescription_percentage: Number(fields.find(f => f.key === 'prescription_percentage')?.value || '0'),
      parasite_enabled: fields.find(f => f.key === 'parasite_enabled')?.value === 'true',
      parasite_percentage: Number(fields.find(f => f.key === 'parasite_percentage')?.value || '0'),
      default_enabled: fields.find(f => f.key === 'default_enabled')?.value === 'true',
      default_percentage: Number(fields.find(f => f.key === 'default_percentage')?.value || '0'),
    };
  } catch (error) {
    console.error('Error fetching discount settings:', error);
    return {
      prescription_enabled: false,
      prescription_percentage: 0,
      parasite_enabled: false,
      parasite_percentage: 0,
      default_enabled: false,
      default_percentage: 0,
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
                  description
                  image {
                    url
                  }
                  products(first: 1) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      });

      return response.body?.data?.collections?.edges?.map(
        ({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
          description: node.description,
          imageUrl: node.image?.url,
          hasProducts: node.products.edges.length > 0
        })
      ).filter((collection: any) => collection.hasProducts) || [];
    },

    getProductsByCollection: async (collectionHandle: string | null = null): Promise<Product[]> => {
      try {
        const discountSettings = await getDiscountSettings();

        const response = await shopifyFetch({
          query: `
            query GetProducts($first: Int!, $collectionHandle: String) {
              collection(handle: $collectionHandle) {
                products(first: $first) {
                  edges {
                    node {
                      id
                      title
                      handle
                      tags
                      vendor
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                      variants(first: 10) {
                        edges {
                          node {
                            id
                            title
                            sku
                            price {
                              amount
                              currencyCode
                            }
                            compareAtPrice {
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
            first: 250,
            collectionHandle: collectionHandle || null,
          },
        });

        if (!response?.body?.data?.collection?.products?.edges) {
          return [];
        }

        const products = response.body.data.collection.products.edges.map((edge: any) => {
          const node = edge.node;
          const variants = node.variants.edges.map((variantEdge: any) => {
            const variant = variantEdge.node;
            const price = variant.price.amount;
            const compareAtPrice = variant.compareAtPrice?.amount;

            const { discountedPrice, discountPercentage } = calculateVariantDiscount(
              {
                id: variant.id,
                title: variant.title,
                sku: variant.sku || '',
                price,
                availableForSale: variant.availableForSale
              },
              node.tags,
              discountSettings
            );

            return {
              id: variant.id,
              title: variant.title,
              sku: variant.sku || '',
              price: formatPrice(price),
              compareAtPrice: compareAtPrice ? formatPrice(compareAtPrice) : null,
              availableForSale: variant.availableForSale,
              discountedPrice,
              discountPercentage
            };
          });

          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            tags: node.tags,
            vendor: node.vendor,
            collection: collectionHandle || '',
            images: node.images.edges.map((imageEdge: any) => ({
              url: imageEdge.node.url,
              altText: imageEdge.node.altText
            })),
            variants
          };
        });

        return products;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
  };
}
