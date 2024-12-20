import '@/styles/globals.css';
import '@/styles/filter.css';
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful')
          },
          err => {
            console.log('ServiceWorker registration failed: ', err)
          }
        )
      })
    }
  }, [])

  return <Component {...pageProps} />
}
