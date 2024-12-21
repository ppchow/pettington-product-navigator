import { NextApiRequest, NextApiResponse } from 'next';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN!;

if (!domain || !storefrontAccessToken) {
  throw new Error('Missing required environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    console.log('Shopify API Request:', {
      url: `https://${domain}/api/2024-01/graphql.json`,
      query
    });

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
      res.status(response.status).json({ 
        message: 'Error from Shopify API',
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return;
    }

    const data = await response.json();
    console.log('Shopify API Response:', data);

    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      res.status(400).json({ 
        message: 'GraphQL Error',
        errors: data.errors
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      message: 'Error fetching data from Shopify',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
