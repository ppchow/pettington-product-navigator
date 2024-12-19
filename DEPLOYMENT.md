# Deploying to Shopify

This guide explains how to deploy your Product Catalog app to Shopify.

## Step 1: Deploy the Next.js App

### Option 1: Deploy to Vercel (Recommended)

1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy the app:
   ```bash
   vercel
   ```
4. Set environment variables in Vercel:
   - NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
   - NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

### Option 2: Deploy to Netlify

1. Create a Netlify account
2. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
3. Deploy the app:
   ```bash
   netlify deploy
   ```

## Step 2: Add to Shopify Store

1. Go to your Shopify admin panel
2. Navigate to Online Store > Themes
3. Click "Customize" on your current theme
4. Add a new section using one of these methods:

### Method 1: Custom HTML Section
1. Add a new section
2. Choose "Custom HTML"
3. Add this code (replace YOUR_DEPLOYED_URL):
   ```html
   <iframe
     src="YOUR_DEPLOYED_URL"
     width="100%"
     height="800px"
     frameborder="0"
     style="border: none;"
   ></iframe>
   ```

### Method 2: Custom App Block
1. Create a custom app in your Shopify Admin
2. Add an app block
3. Use the app URL as your deployed Next.js app URL

## Step 3: Customize Appearance

1. Adjust the iframe height in your theme settings
2. Style the container as needed
3. Test on different devices to ensure responsive design

## Troubleshooting

1. If images don't load, check your Shopify CDN settings
2. If you see CSP errors, verify your Content-Security-Policy headers
3. For CORS issues, check your Shopify app settings

## Support

For any issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure your Shopify API access is configured correctly
