import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Invoice = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Adding the title and the basic information
    doc.setFontSize(25);
    doc.text('M/S RAM DHANI SHAW', 60, 23);
    doc.setFontSize(13);
    doc.text('TAX INVOICE', 90, 12);
    doc.setFontSize(11);
    doc.text('PROPRIETOR: ASHOK KUMAR SHAW', 70, 32);
    doc.text('31/A PULIN KHATICK ROAD KOLKATA – 700015', 60, 38);
    doc.text('GST IN 19AKWPS4940B1ZO', 14, 48);
    doc.text('MOBILE- 8820416613', 150, 48);

    // Adding invoice details
    doc.text(`Invoice No: ${data.invoiceNo}`, 14, 55);
    doc.text(`Invoice Date: ${data.invoiceDate}`, 14, 61);
    doc.text('State: WEST BENGAL    Code- 19', 14, 67);
    doc.text(`Transport Name: ${data.transportName}`, 110, 55);
    doc.text(`G.C.N./R.R.NO: ${data.gcn}`, 110, 61);
    doc.text(`Place of Supply: ${data.placeOfSupply}`, 110, 67);

    doc.line(14, 70, 202, 70);
    
    // Adding receiver details
    doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', 60, 77);
    doc.text(`NAME: ${data.receiverName}`, 14, 83);
    doc.text(`ADDRESS: ${data.receiverAddress}`, 14, 89);
    doc.text(`GST IN: ${data.receiverGST}`, 14, 95);
    doc.text(`STATE: ${data.receiverState}`, 14, 101);
    doc.text(`CODE: ${data.receiverCode}`, 70, 101);
    
    doc.line(14, 105, 202, 105);

    // Adding the table
    const tableColumn = ['S.NO', 'DESCRIPTION OF GOODS', 'HSN CODE', 'QNTY', 'RATE', 'AMOUNT'];
    const tableRows = data.items.map((item, index) => [
      index + 1,
      item.description,
      item.hsnCode,
      item.quantity,
      item.rate,
      (item.quantity * item.rate).toFixed(2),
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 110 });

    // Adding the bank details and totals
    doc.text('TOTAL INVOICE AMOUNT IN WORDS –', 14, doc.lastAutoTable.finalY + 10);
    doc.text('TOTAL AMOUNT BEFORE TAX', 100, doc.lastAutoTable.finalY + 20);

    doc.text('BANK DETAILS', 14, doc.lastAutoTable.finalY + 16);
    doc.text(`BANK – ${data.bankDetails.bankName}`, 14, doc.lastAutoTable.finalY + 22);
    doc.text(`BRANCH – ${data.bankDetails.branch}`, 14, doc.lastAutoTable.finalY + 28);
    doc.text(`BANK A/C NO – ${data.bankDetails.accountNo}`, 14, doc.lastAutoTable.finalY + 34);
    doc.text(`BANK IFSC CODE – ${data.bankDetails.ifscCode}`, 14, doc.lastAutoTable.finalY + 40);

    doc.text(`ADD – CGST @ ${data.taxDetails.cgst}`, 100, doc.lastAutoTable.finalY + 26);
    doc.text(`ADD – SGST @ ${data.taxDetails.sgst}`, 100, doc.lastAutoTable.finalY + 32);
    doc.text(`ADD – IGST @ ${data.taxDetails.igst}`, 100, doc.lastAutoTable.finalY + 38);
    doc.text(`OTHER CHARGES ${data.taxDetails.otherCharges}`, 100, doc.lastAutoTable.finalY + 44);
    doc.text(`ROUNDED OFF ${data.taxDetails.roundedOff}`, 100, doc.lastAutoTable.finalY + 50);
    doc.text('TOTAL AMOUNT AFTER TAX', 100, doc.lastAutoTable.finalY + 56);

    doc.text('TERMS & CONDITIONS – PLEASE PAY BY A/C BY RTGS/NEFT/BANK TRANSFER.', 14, doc.lastAutoTable.finalY + 68);
    doc.text('E. & O.E', 168, doc.lastAutoTable.finalY + 74);

    doc.text('AUTHORISED SIGNATORY', 150, doc.lastAutoTable.finalY + 95);

    // Save the PDF
    doc.save('invoice.pdf');
  };

  return (
    <div className=''>
      <button onClick={generatePDF} className="px-4 py-2 bg-blue-500 text-white rounded-md max-w-4xl fixed bottom-2 md:bottom-10 right-2 md:right-10">Generate PDF</button>
    </div>
  );
};

export default Invoice;
