import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Function to convert number to words
const numberToWords = (num) => {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
  ];

  const inWords = (num) => {
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{1})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' only' : '';
    return str.trim();
  };

  return inWords(num);
};

const Invoice = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    const copyLabels = [
      "Orignial Buyer's copy",
      "Orignial Buyer's copy",
      "Orignial Buyer's copy",
      "Orignial Buyer's copy",
      "Orignial Seller's copy",
      "Orignial Transport's copy",
    ];

    copyLabels.forEach((label, index) => {
      if (index > 0) doc.addPage();

      // Add copy label
      doc.setFontSize(8);
      doc.text(label, pageWidth - 10, 5, { align: 'right' });

      // Add title and basic information
      doc.setFontSize(16);
      doc.text('M/S RAM DHANI SHAW', pageWidth / 2, 19, { align: 'center' });
      doc.setFontSize(10);
      doc.text('TAX INVOICE', pageWidth / 2, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.text('PROPRIETOR: ASHOK KUMAR SHAW', pageWidth / 2, 25, { align: 'center' });
      doc.text('31/A PULIN KHATICK ROAD KOLKATA – 700015', pageWidth / 2, 29, { align: 'center' });
      doc.text(`GST IN 19AKWPS4940B1ZO`, margin, 35);
      doc.text(`MOBILE- 8820416613`, pageWidth - margin, 35, { align: 'right' });

      // Add invoice details
      doc.line(margin, 38, pageWidth - margin, 38);
      doc.text(`Invoice No: ${data.invoiceNo}`, margin, 42);
      doc.text(`Invoice Date: ${data.invoiceDate}`, margin, 46);
      doc.text('State: WEST BENGAL    Code- 19', margin, 50);
      doc.text(`Transport Name: ${data.transportName}`, pageWidth / 2, 42);
      doc.text(`G.C.N./R.R.NO: ${data.gcn}`, pageWidth / 2, 46);
      doc.text(`Place of Supply: ${data.placeOfSupply}`, pageWidth / 2, 50);

      // Add receiver details
      doc.line(margin, 53, pageWidth - margin, 53);
      doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', pageWidth / 2, 58, { align: 'center' });
      doc.line(margin, 61, pageWidth - margin, 61);
      doc.text(`NAME: ${data.receiverName}`, margin, 66);
      doc.text(`ADDRESS: ${data.receiverAddress}`, margin, 70);
      doc.text(`GST IN: ${data.receiverGST}`, margin, 74);
      doc.text(`STATE: ${data.receiverState}`, margin, 78);
      doc.text(`CODE: ${data.receiverCode}`, pageWidth / 2, 78);

      // Add table
      const tableColumn = ['S.NO', 'DESCRIPTION OF GOODS', 'HSN CODE', 'QNTY', 'RATE', 'AMOUNT'];
      let tableRows = data.items.map((item, index) => [
        index + 1,
        item.description,
        item.hsnCode,
        item.quantity,
        item.rate,
        (item.quantity * item.rate).toFixed(2),
      ]);

      // Ensure table has 15 rows
      while (tableRows.length < 15) {
        tableRows.push(['', '', '', '', '', '']);
      }

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85, // Adjusted startY to push the table down
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [200, 200, 200], textColor: 20 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
        },
        tableWidth: 'auto', // Adjusted to fit the table within the page width
        margin: { left: margin, right: margin }, // Added margin to fit the table within the page width
      });

      // Calculate totals
      const totalAmountBeforeTax = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);
      const cgst = (totalAmountBeforeTax * 0.09).toFixed(2);
      const igst = (totalAmountBeforeTax * 0.09).toFixed(2);
      const totalAmountAfterTax = (parseFloat(totalAmountBeforeTax) + parseFloat(cgst) + parseFloat(igst)).toFixed(2);
      const totalAmountInWords = numberToWords(parseFloat(totalAmountAfterTax).toFixed(0));

      // Add totals and bank details
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(7);
      doc.text(`TOTAL INVOICE AMOUNT IN WORDS – ${totalAmountInWords.toUpperCase()}`, margin, finalY + 5);
      doc.text(`TOTAL AMOUNT BEFORE TAX: ${totalAmountBeforeTax}`, pageWidth - margin, finalY + 10, { align: 'right' });
      doc.text(`ADD – CGST @ 9%: ${cgst}`, pageWidth - margin, finalY + 14, { align: 'right' });
      doc.text(`ADD – IGST @ 9%: ${igst}`, pageWidth - margin, finalY + 18, { align: 'right' });
      doc.text(`TOTAL AMOUNT AFTER TAX: ${totalAmountAfterTax}`, pageWidth - margin, finalY + 22, { align: 'right' });

      doc.text('BANK DETAILS', margin, finalY + 10);
      doc.text(`BANK – ${data.bankDetails.bankName}`, margin, finalY + 14);
      doc.text(`BRANCH – ${data.bankDetails.branch}`, margin, finalY + 18);
      doc.text(`BANK A/C NO – ${data.bankDetails.accountNo}`, margin, finalY + 22);
      doc.text(`BANK IFSC CODE – ${data.bankDetails.ifscCode}`, margin, finalY + 26);

      doc.text('TERMS & CONDITIONS – PLEASE PAY BY A/C BY RTGS/NEFT/BANK TRANSFER.', margin, finalY + 32);
      doc.text('E. & O.E', pageWidth - margin, finalY + 32, { align: 'right' });

      doc.text('AUTHORISED SIGNATORY', pageWidth - margin, pageHeight - margin, { align: 'right' });
    });

    // Save the PDF
    doc.save('invoice.pdf');
  };

  return (
    <div className=''>
      <button onClick={generatePDF} className="px-4 py-2 bg-blue-500 text-white rounded-md max-w-4xl fixed bottom-4 md:bottom-10 right-4 md:right-10">
        Generate PDF
      </button>
    </div>
  );
};

export default Invoice;