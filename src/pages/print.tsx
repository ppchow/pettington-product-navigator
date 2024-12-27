import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@/types';
import Head from 'next/head';

const PrintPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiscountPrice, setShowDiscountPrice] = useState(true);
  const [showSku, setShowSku] = useState(true);

  useEffect(() => {
    // Get products and display preferences from localStorage
    const data = JSON.parse(localStorage.getItem('printProducts') || '{}');
    const { products = [], showDiscountPrice = true, showSku = true } = data;
    
    if (products.length === 0) {
      router.push('/print-select');
      return;
    }

    setProducts(products);
    setShowDiscountPrice(showDiscountPrice);
    setShowSku(showSku);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group products into pairs for 2-column layout
  const productPairs = [];
  for (let i = 0; i < products.length; i += 2) {
    productPairs.push(products.slice(i, i + 2));
  }

  return (
    <>
      <Head>
        <title>Print Products - Pettington Product Catalog</title>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </Head>

      <div className="p-4">
        <div className="no-print mb-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Print
          </button>
        </div>

        <div className="print-content">
          <h1 className="text-2xl font-bold mb-6">Product List</h1>
          {productPairs.map((pair, index) => (
            <div key={index} className="print-row">
              {pair.map((product) => (
                <div key={product.id} className="print-item">
                  <h2 className="product-title">{product.title}</h2>
                  <div className="variants-list">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="variant-item">
                        <div className="variant-info">
                          <div className="variant-title">
                            {variant.title}
                            {showSku && variant.sku && <span className="sku"> (SKU: {variant.sku})</span>}
                          </div>
                          <div className="price-container">
                            {showDiscountPrice && variant.discountedPrice && (
                              <span className="original-price">
                                ${parseFloat(variant.price).toFixed(2)}
                              </span>
                            )}
                            <span className={variant.discountedPrice && showDiscountPrice ? 'discount-price' : 'regular-price'}>
                              ${(variant.discountedPrice && showDiscountPrice ? parseFloat(variant.discountedPrice) : parseFloat(variant.price)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Add empty placeholder if there's only one product in the row */}
              {pair.length === 1 && <div className="print-item empty"></div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrintPage;
