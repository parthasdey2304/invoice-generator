import jsPDF from 'jspdf';

const generateInvoice = (invoiceData) => {
  const doc = new jsPDF();

  doc.text(`GST Number: ${invoiceData.gstNumber}`, 10, 10);
  doc.text(`Transporter Name: ${invoiceData.transporterName}`, 10, 20);
  doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 10, 30);
  doc.text(`Invoice Date: ${invoiceData.invoiceDate}`, 10, 40);
  // More text...
  doc.save('invoice.pdf');
};

export default generateInvoice;
