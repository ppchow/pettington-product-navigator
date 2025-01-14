import { NextApiRequest, NextApiResponse } from 'next';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, AlignmentType, ImageRun } from 'docx';
import { Product, ProductVariant } from '@/types';

interface ExportRequest {
  products: Product[];
  showDiscountPrice: boolean;
  showSku: boolean;
  selectedTags: string[];
}

async function getImageAsBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { products, showDiscountPrice, showSku, selectedTags } = req.body as ExportRequest;
    const rows: TableRow[] = [];
    
    // Header row
    const headerRow = new TableRow({
      children: [
        createHeaderCell('Image', 15),
        createHeaderCell('Product', 20),
        createHeaderCell('Variant', 15),
        createHeaderCell('SKU', 15),
        createHeaderCell('Price', 15),
        createHeaderCell('Tags', 20),
      ],
    });
    rows.push(headerRow);

    // Product rows
    for (const product of products) {
      const selectedVariants = product.variants.filter((v: ProductVariant) => v.selected);
      if (selectedVariants.length === 0) continue;

      // Get the first image from the product's images array
      const imageBuffer = product.images && product.images.length > 0 
        ? await getImageAsBuffer(product.images[0].url) 
        : null;

      const row = new TableRow({
        children: [
          // Image cell
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            rowSpan: selectedVariants.length,
            children: [new Paragraph({ 
              children: imageBuffer ? [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 100,
                    height: 100,
                  },
                  docProperties: {
                    name: "Product Image",
                    description: "Product Image"
                  }
                })
              ] : [new TextRun({ text: 'No Image' })]
            })],
            borders: getDefaultBorders(),
          }),
          // Product cell
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            rowSpan: selectedVariants.length,
            children: [
              new Paragraph({
                children: [new TextRun({ text: product.title, bold: true })]
              }),
            ],
            borders: getDefaultBorders(),
          }),
          // First variant's title
          createVariantTitleCell(selectedVariants[0]),
          // First variant's SKU
          createSkuCell(selectedVariants[0], showSku),
          // First variant's price
          createPriceCell(selectedVariants[0], showDiscountPrice),
          // Tags cell
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            rowSpan: selectedVariants.length,
            children: [new Paragraph({ 
              children: [new TextRun({ 
                text: product.tags
                  .filter(tag => selectedTags.includes(tag))
                  .join(', ')
              })]
            })],
            borders: getDefaultBorders(),
          }),
        ],
      });
      rows.push(row);

      // Add additional rows for remaining variants
      for (let i = 1; i < selectedVariants.length; i++) {
        const variantRow = new TableRow({
          children: [
            createVariantTitleCell(selectedVariants[i]),
            createSkuCell(selectedVariants[i], showSku),
            createPriceCell(selectedVariants[i], showDiscountPrice),
          ],
        });
        rows.push(variantRow);
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 500,
              right: 500,
              bottom: 500,
              left: 500,
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Product List (Compact View)",
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=product-list-compact.docx');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ message: 'Error generating document' });
  }
}

function createVariantTitleCell(variant: ProductVariant) {
  return new TableCell({
    width: { size: 15, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: variant.title })
        ]
      })
    ],
    borders: getDefaultBorders(),
  });
}

function createSkuCell(variant: ProductVariant, showSku: boolean) {
  return new TableCell({
    width: { size: 15, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ 
            text: showSku && variant.sku ? variant.sku : ''
          })
        ]
      })
    ],
    borders: getDefaultBorders(),
  });
}

function createPriceCell(variant: ProductVariant, showDiscountPrice: boolean) {
  return new TableCell({
    width: { size: 15, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    children: [
      new Paragraph({
        children: [
          ...(showDiscountPrice && variant.discountedPrice ? [
            new TextRun({ 
              text: `$${parseFloat(variant.price).toFixed(2)}`,
              strike: true,
              color: '808080'
            }),
            new TextRun({ text: '\n' }),
            new TextRun({ 
              text: `$${parseFloat(variant.discountedPrice).toFixed(2)}`,
              bold: true,
              color: 'FF0000'
            })
          ] : [
            new TextRun({ 
              text: `$${parseFloat(variant.price).toFixed(2)}`
            })
          ])
        ]
      })
    ],
    borders: getDefaultBorders(),
  });
}

function createHeaderCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true })],
      alignment: AlignmentType.CENTER,
    })],
    borders: getDefaultBorders(),
  });
}

function getDefaultBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1 },
    bottom: { style: BorderStyle.SINGLE, size: 1 },
    left: { style: BorderStyle.SINGLE, size: 1 },
    right: { style: BorderStyle.SINGLE, size: 1 },
  };
}
