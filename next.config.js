const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
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
}

module.exports = withPWA(nextConfig)
