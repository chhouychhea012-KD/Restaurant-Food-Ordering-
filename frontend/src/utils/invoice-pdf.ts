import type { Order } from '@/types';

type InvoiceFormatter = {
  currency: (value: number) => string;
  dateTime: (value: string) => string;
  payment: (order: Order) => string;
  status: (value: string) => string;
};

const pageWidth = 595;
const pageHeight = 842;
const left = 48;
const right = pageWidth - 48;

function cleanPdfText(value: string) {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .trim();
}

function drawText(text: string, x: number, y: number, size = 11, font = 'F1') {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${cleanPdfText(text)}) Tj ET`;
}

function drawLine(x1: number, y1: number, x2: number, y2: number) {
  return `0.7 w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function wrapText(text: string, maxChars: number) {
  const words = cleanPdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : ['-'];
}

function drawWrappedText(text: string, x: number, y: number, maxChars: number, size = 10, lineHeight = 14) {
  return wrapText(text, maxChars).map((line, index) => drawText(line, x, y - index * lineHeight, size)).join('\n');
}

function buildPdf(objects: string[]) {
  const offsets = [0];
  let pdf = '%PDF-1.4\n';

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function buildInvoicePdf(order: Order, formatter: InvoiceFormatter) {
  const commands: string[] = [];
  let y = 790;

  commands.push(drawText('Flavor Fleet Invoice', left, y, 12, 'F2'));
  commands.push(drawText(order.restaurantName, left, y - 32, 26, 'F2'));
  commands.push(drawText(`Invoice ${order.id}`, left, y - 54, 12));
  commands.push(drawText(`Placed ${formatter.dateTime(order.createdAt)}`, left, y - 72, 10));
  commands.push(drawText('Total', 430, y - 16, 11));
  commands.push(drawText(formatter.currency(order.total), 430, y - 42, 24, 'F2'));
  commands.push(drawLine(left, y - 98, right, y - 98));

  y -= 130;
  commands.push(drawText('Delivery Address', left, y, 12, 'F2'));
  commands.push(drawWrappedText(order.deliveryAddress, left, y - 20, 64, 10));
  commands.push(drawText('Delivery Status', 330, y, 12, 'F2'));
  commands.push(drawWrappedText(`${formatter.status(order.status)}${order.riderName ? ` with ${order.riderName}` : ''}`, 330, y - 20, 34, 10));

  y -= 98;
  commands.push(drawLine(left, y + 18, right, y + 18));
  commands.push(drawText('Item', left, y, 10, 'F2'));
  commands.push(drawText('Qty', 330, y, 10, 'F2'));
  commands.push(drawText('Price', 380, y, 10, 'F2'));
  commands.push(drawText('Total', 470, y, 10, 'F2'));
  commands.push(drawLine(left, y - 12, right, y - 12));
  y -= 34;

  order.items.slice(0, 12).forEach((item) => {
    commands.push(drawWrappedText(item.name, left, y, 38, 10));
    commands.push(drawText(String(item.quantity), 335, y, 10));
    commands.push(drawText(formatter.currency(item.price), 380, y, 10));
    commands.push(drawText(formatter.currency(item.price * item.quantity), 470, y, 10));
    y -= 34;
  });

  if (order.items.length > 12) {
    commands.push(drawText(`+ ${order.items.length - 12} more item(s) shown in app receipt`, left, y, 9));
    y -= 26;
  }

  y -= 10;
  commands.push(drawLine(310, y + 18, right, y + 18));
  commands.push(drawText('Payment', 310, y, 10));
  commands.push(drawText(formatter.payment(order), 410, y, 10));
  y -= 22;
  commands.push(drawText('Subtotal', 310, y, 10));
  commands.push(drawText(formatter.currency(order.subtotal), 470, y, 10));
  y -= 22;
  commands.push(drawText('Delivery Fee', 310, y, 10));
  commands.push(drawText(formatter.currency(order.deliveryFee), 470, y, 10));
  y -= 22;
  commands.push(drawText('Discount', 310, y, 10));
  commands.push(drawText(`-${formatter.currency(order.discount)}`, 470, y, 10));
  y -= 28;
  commands.push(drawLine(310, y + 14, right, y + 14));
  commands.push(drawText('Grand Total', 310, y, 13, 'F2'));
  commands.push(drawText(formatter.currency(order.total), 455, y, 13, 'F2'));

  commands.push(drawText('Thank you for your order.', left, 60, 10));

  const content = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  return buildPdf(objects);
}

export function createInvoicePdfBlob(order: Order, formatter: InvoiceFormatter) {
  return new Blob([buildInvoicePdf(order, formatter)], { type: 'application/pdf' });
}