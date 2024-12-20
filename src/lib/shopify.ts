const STOREFRONT_API_VERSION = '2024-01';

interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string; 
}

export class ShopifyClient {
  private endpoint: string;
  private accessToken: string;

  constructor(config: ShopifyConfig) {
    this.endpoint = `https://${config.storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;
    this.accessToken = config.storefrontAccessToken;
  }
git add .
git commit -m "Fix: TypeScript error with Set iteration"
git push origin maingit add .
git commit -m "Fix: TypeScript error with Set iteration"
git push origin maingit add .
git commit -m "Fix: TypeScript error with Set iteration"
git push origin maingit add .
git commit -m "Fix: TypeScript error with Set iteration"
git push origin main
  private async fetchApi(query: string, variables?: any) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);  // Debug log
      
      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching from Shopify:', error);
      throw error;
    }
  }

  async getAllProducts() {
    const query = `
      {
        products(first: 250) {
          edges {
            node {
              id
              title
              vendor
              tags
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    weight
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
    `;

    try {
      const response = await this.fetchApi(query);
      console.log('GraphQL Response:', response);  // Debug log
      
      if (!response.data?.products?.edges) {
        console.error('Invalid response structure:', response);
        return [];
      }
      
      return this.transformProducts(response.data.products.edges);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getCollections() {
    const query = `
      query {
        collections(first: 250) {
          edges {
            node {
              id
              handle
              title
              description
            }
          }
        }
      }
    `;

    const response = await this.fetchApi(query);
    return response.data.collections.edges.map((edge: any) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description
    }));
  }

  async getProductsByCollection(collectionHandle: string) {
    const query = `
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
    `;

    try {
      const response = await this.fetchApi(query, { handle: collectionHandle });
      console.log('Collection products response:', response);

      if (!response.data?.collection?.products?.edges) {
        console.error('Invalid collection products response:', response);
        return [];
      }

      return response.data.collection.products.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        vendor: edge.node.vendor,
        tags: edge.node.tags,
        price: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: edge.node.priceRange.minVariantPrice.currencyCode,
        }).format(edge.node.priceRange.minVariantPrice.amount),
        imageUrl: edge.node.images.edges[0]?.node.url || '',
        imageAltText: edge.node.images.edges[0]?.node.altText || edge.node.title,
      }));
    } catch (error) {
      console.error('Error fetching collection products:', error);
      throw error;
    }
  }

  private transformProducts(data: any) {
    console.log('Raw product data:', data);  // Debug log
    if (!Array.isArray(data)) {
      console.error('Expected array of products, got:', typeof data);
      return [];
    }
    
    return data.map((edge: any) => {
      const product = edge.node;
      console.log('Processing product:', product.title);  // Debug log
      
      if (!product) {
        console.error('Invalid product data:', edge);
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        vendor: product.vendor,
        tags: product.tags || [],
        variants: (product.variants?.edges || []).map((variantEdge: any) => {
          const variant = variantEdge.node;
          return {
            id: variant.id,
            weight: parseFloat(variant.weight) || 0,
            price: `${variant.price.amount} ${variant.price.currencyCode}`,
            available: variant.availableForSale,
          };
        }),
        imageUrl: product.featuredImage?.url || '',
        imageAltText: product.featuredImage?.altText || '',
      };
    }).filter(Boolean); // Remove any null products
  }
}

export function getShopifyClient() {
  return new ShopifyClient({
    storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
    storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
  });
}
