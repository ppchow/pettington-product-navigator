import { NextApiRequest, NextApiResponse } from 'next';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, AlignmentType } from 'docx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { products, showDiscountPrice, showSku } = req.body;
    const rows: TableRow[] = [];
    
    // Create rows with 2 products each
    for (let i = 0; i < products.length; i += 2) {
      const leftProduct = products[i];
      const rightProduct = products[i + 1];
      
      const row = new TableRow({
        children: [
          // Left product cell
          new TableCell({
            width: {
              size: 50,
              type: WidthType.PERCENTAGE,
            },
            margins: {
              top: 150,
              bottom: 150,
              left: 150,
              right: 150,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            children: createProductContent(leftProduct, showDiscountPrice, showSku),
          }),
          // Right product cell (if exists)
          new TableCell({
            width: {
              size: 50,
              type: WidthType.PERCENTAGE,
            },
            margins: {
              top: 150,
              bottom: 150,
              left: 150,
              right: 150,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            children: rightProduct ? createProductContent(rightProduct, showDiscountPrice, showSku) : [new Paragraph({})],
          }),
        ],
        height: {
          value: 2000,
          rule: 'atLeast',
        },
      });
      
      rows.push(row);
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
          // Page Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Product List",
                bold: true,
                size: 36,
              }),
            ],
            spacing: {
              after: 400,
            },
          }),
          // Products Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            columnWidths: [50, 50],
            rows: rows,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=product-catalog.docx');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ message: 'Error generating document' });
  }
}

function createProductContent(product: any, showDiscountPrice: boolean, showSku: boolean) {
  if (!product) return [new Paragraph({})];

  const variants = product.variants || [];
  return [
    // Product Title with bottom border
    new Paragraph({
      children: [
        new TextRun({
          text: product.title,
          bold: true,
          size: 24,
        }),
      ],
      spacing: {
        after: 200,
      },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: "000000",
        },
      },
    }),
    // Variants
    ...variants.map((variant: any) => 
      new Paragraph({
        children: [
          new TextRun({
            text: variant.title,
            size: 20,
          }),
          ...(showSku && variant.sku ? [
            new TextRun({
              text: ` (SKU: ${variant.sku})`,
              size: 20,
            }),
          ] : []),
          new TextRun({
            text: "\t",
          }),
          ...(showDiscountPrice && variant.discountedPrice ? [
            new TextRun({
              text: `$${parseFloat(variant.price).toFixed(2)}`,
              strike: true,
              color: '666666',
              size: 20,
            }),
            new TextRun({
              text: ' ',
              size: 20,
            }),
          ] : []),
          new TextRun({
            text: `$${(variant.discountedPrice && showDiscountPrice ? parseFloat(variant.discountedPrice) : parseFloat(variant.price)).toFixed(2)}`,
            bold: variant.discountedPrice && showDiscountPrice ? true : false,
            color: variant.discountedPrice && showDiscountPrice ? 'FF0000' : '000000',
            size: 20,
          }),
        ],
        spacing: {
          before: 120,
          after: 120,
        },
        tabStops: [
          {
            type: AlignmentType.RIGHT,
            position: 4000,
          },
        ],
      }),
    ),
  ];
}
