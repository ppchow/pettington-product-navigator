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

      const collections = response.body?.data?.collections?.edges?.map(
        ({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
        })
      );

      return collections || [];
    },

    getProductsByCollection: async (collectionHandle: string) => {
      const response = await shopifyFetch({
        query: `
          query GetProductsByCollection($handle: String!) {
            collection(handle: $handle) {
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    tags
                    vendor
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
                    variants(first: 1) {
                      edges {
                        node {
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
        ({ node }: any) => ({
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
        })
      );

      return products || [];
    },
  };
}
