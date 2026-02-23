import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface ReceiptData {
    businessName: string;
    receiptNumber: string;
    date: string;
    items: ReceiptItem[];
    totalAmount: number;
    currencySymbol: string;
    userName: string;
}

export const generateReceipt = (data: ReceiptData) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150] // POS thermal printer size
    });

    const width = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(data.businessName, width / 2, 10, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Receipt', width / 2, 15, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(5, 18, width - 5, 18);

    // Info
    doc.setFontSize(8);
    doc.text(`Date: ${data.date}`, 5, 25);
    doc.text(`Receipt: ${data.receiptNumber}`, 5, 30);
    doc.text(`Sales Rep: ${data.userName}`, 5, 35);

    // Table
    const tableData = data.items.map(item => [
        item.name,
        item.quantity.toString(),
        `${data.currencySymbol}${item.price.toFixed(2)}`,
        `${data.currencySymbol}${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
        startY: 40,
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fontStyle: 'bold', borderBottom: 0.1 },
        margin: { left: 5, right: 5 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${data.currencySymbol}${data.totalAmount.toFixed(2)}`, width - 5, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', width / 2, finalY + 15, { align: 'center' });

    return doc;
};
