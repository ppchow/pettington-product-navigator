const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.myshopify\.com\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'shopify-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 2
      }
    },
    {
      urlPattern: /^https:\/\/cdn\.shopify\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'shopify-image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        },
        matchOptions: {
          ignoreVary: true
        }
      }
    },
    {
      urlPattern: /\/api\/(collections|products|shopify)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 2
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com'], // Allow Shopify CDN images
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com;`,
          },
        ],
      },
    ];
  },
  // Optimize for embedding in Shopify
  output: 'standalone',
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.watchOptions = {
      ignored: ['**/backup/**', '**/backup.prev/**']
    }
    return config
  }
}

module.exports = withPWA(nextConfig)
