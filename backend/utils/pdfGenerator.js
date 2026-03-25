import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    // Standard A4 is 595.28 x 841.89 points
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      info: { Title: `Invoice-${invoice.invoiceNumber}`, Author: 'Rasoi' }
    });

    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- Modern Branding Palette ---
    const brandColor = '#D4AF37'; // Elegant Gold
    const accentColor = '#2D3436'; // Deep Charcoal
    const textMain = '#2D3436';
    const textMuted = '#636E72';
    const borderLight = '#DFE6E9';
    const bgLight = '#F9FAFB';

    // --- 1. Top Header Area ---
    // Left: Brand Name
    doc.fillColor(brandColor)
      .font('Helvetica-Bold')
      .fontSize(32)
      .text('RASOI', 40, 45);

    doc.fillColor(textMuted)
      .font('Helvetica')
      .fontSize(10)
      .text('PREMIUM DINING EXPERIENCE', 42, 78, { characterSpacing: 1 });

    // Right: Invoice Label
    doc.fillColor(textMain)
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('INVOICE', 400, 45, { align: 'right' });

    doc.fillColor(textMuted)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`ID: #${invoice.invoiceNumber}`, 400, 70, { align: 'right' });

    // Horizontal Divider
    doc.moveTo(40, 105).lineTo(555, 105).strokeColor(borderLight).stroke();

    // --- 2. Information Grid ---
    const infoY = 125;

    // Billed To Column
    doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9).text('BILLED TO', 40, infoY);
    doc.fillColor(textMain).fontSize(12).font('Helvetica-Bold').text(invoice.customerName || invoice.customer?.name || 'Walk-in Guest', 40, infoY + 15);
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text(invoice.customerEmail || invoice.customer?.email || '', 40, infoY + 32);

    // Invoice Details Column
    doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9).text('DATE OF ISSUE', 240, infoY);
    doc.fillColor(textMain).fontSize(10).font('Helvetica').text(new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }), 240, infoY + 15);

    doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9).text('ORDER TYPE', 240, infoY + 40);
    doc.fillColor(textMain).fontSize(10).font('Helvetica').text(invoice.orderType || 'Dine-in', 240, infoY + 55);

    // Status / Payment Column
    doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9).text('PAYMENT STATUS', 430, infoY, { align: 'right' });
    const statusColor = invoice.status === 'paid' ? '#00B894' : '#FF7675';
    doc.fillColor(statusColor).fontSize(11).font('Helvetica-Bold').text(invoice.status.toUpperCase(), 430, infoY + 15, { align: 'right' });

    doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9).text('METHOD', 430, infoY + 40, { align: 'right' });
    doc.fillColor(textMain).fontSize(10).font('Helvetica').text(invoice.paymentMethod?.toUpperCase() || 'CASH', 430, infoY + 55, { align: 'right' });

    // --- 3. Items Table ---
    const tableTop = 230;

    // Header Bar
    doc.rect(40, tableTop, 515, 25).fill(accentColor);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
      .text('DESCRIPTION', 55, tableTop + 9)
      .text('QTY', 340, tableTop + 9, { width: 40, align: 'center' })
      .text('UNIT PRICE', 390, tableTop + 9, { width: 70, align: 'right' })
      .text('AMOUNT', 475, tableTop + 9, { width: 70, align: 'right' });

    let itemY = tableTop + 35;
    const items = invoice.items || [];

    items.forEach((item, index) => {
      // Alternating Row Background
      if (index % 2 === 0) {
        doc.fillColor(bgLight).rect(40, itemY - 5, 515, 25).fill();
      }

      doc.fillColor(textMain).font('Helvetica').fontSize(10)
        .text(item.name, 55, itemY)
        .text(item.quantity.toString(), 340, itemY, { width: 40, align: 'center' })
        .text(formatCurrency(item.price), 390, itemY, { width: 70, align: 'right' })
        .text(formatCurrency(item.total), 475, itemY, { width: 70, align: 'right' });

      itemY += 25;
    });

    // --- 4. Summary Area ---
    const summaryY = itemY + 20;
    const summaryWidth = 180;
    const summaryX = 375;

    doc.moveTo(summaryX, summaryY).lineTo(555, summaryY).strokeColor(borderLight).lineWidth(1).stroke();

    // Subtotal
    doc.fillColor(textMuted).font('Helvetica').fontSize(10).text('Subtotal', summaryX, summaryY + 15);
    doc.fillColor(textMain).text(formatCurrency(invoice.subtotal), summaryX, summaryY + 15, { align: 'right', width: summaryWidth });

    // Tax
    doc.fillColor(textMuted).text(`GST (${invoice.taxRate}%)`, summaryX, summaryY + 32);
    doc.fillColor(textMain).text(formatCurrency(invoice.tax), summaryX, summaryY + 32, { align: 'right', width: summaryWidth });

    // Total Background Box
    doc.rect(summaryX - 10, summaryY + 55, summaryWidth + 20, 35).fill(accentColor);

    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('TOTAL', summaryX, summaryY + 66);
    doc.fillColor(brandColor).fontSize(16).text(formatCurrency(invoice.total), summaryX, summaryY + 66, { align: 'right', width: summaryWidth });

    // --- 5. Footer ---
    const footerY = 760;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(borderLight).stroke();

    doc.fillColor(textMuted).fontSize(9).font('Helvetica')
      .text('Thank you for dining with Rasoi!', 40, footerY + 15, { align: 'center', width: 515 });

    doc.fillColor(textMuted).fontSize(8)
      .text('This is a computer-generated invoice. No signature required.', 40, footerY + 30, { align: 'center', width: 515 });

    doc.end();
  });
};

// Helper inside the file to handle ₹ formatting
const formatCurrency = (num) => `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;