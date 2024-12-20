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

      console.log('Collections response:', response);
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
        console.log('Fetched discount settings:', discountSettings);

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
          console.error('No products found in response:', response);
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

        console.log('Processed products:', products.map((p: Product) => ({
          title: p.title,
          tags: p.tags,
          variants: p.variants.map((v: ProductVariant) => ({
            title: v.title,
            price: v.price,
            discountedPrice: v.discountedPrice,
            discountPercentage: v.discountPercentage,
            availableForSale: v.availableForSale
          }))
        })));

        return products;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
  };
}
