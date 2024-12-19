# Shopify Product Navigator

A fast, lightweight, and offline-capable product navigation interface for in-person events.

## Features

- Offline-first architecture
- Quick product discovery and presentation
- PWA support
- Responsive design for touch interfaces
- Hierarchical navigation system
- Full offline product catalog

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Service Workers
- IndexedDB
- Shopify Storefront API

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your Shopify credentials:
   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Offline Capabilities

- Complete product catalog available offline
- Cached product images
- Background sync for updates
- Fallback UI for no connectivity

## Performance

- < 1 second page load time
- Minimal JavaScript
- Optimized assets
- Efficient caching strategies
