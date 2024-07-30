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

// Function to handle rounding logic
const roundOffValue = (value) => {
  const paise = value * 100;
  const fractionalPart = paise % 100;
  if (fractionalPart >= 50) {
    return Math.ceil(value);
  } else {
    return Math.floor(value);
  }
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
      "Orignial Seller's copy",
      "Orignial Transport's copy",
    ];

    copyLabels.forEach((label, index) => {
      if (index > 0) doc.addPage();

      // Set stroke color to light blue
      doc.setDrawColor(2, 176, 252);

      // Add copy label
      doc.setFontSize(11);
      doc.setFont('Cambria Math');
      doc.text(label, pageWidth - 10, 7, { align: 'right' });

      // Add title and basic information
      doc.setFontSize(19);
      doc.text('M/S RAM DHANI SHAW', pageWidth / 2, 21, { align: 'center' });
      doc.setFontSize(13);
      doc.text('TAX INVOICE', pageWidth / 2, 12, { align: 'center' });
      doc.setFontSize(11);
      doc.text('PROPRIETOR: ASHOK KUMAR SHAW', pageWidth / 2, 27, { align: 'center' });
      doc.text('31/A PULIN KHATICK ROAD KOLKATA – 700015', pageWidth / 2, 31, { align: 'center' });
      doc.text(`GST IN 19AKWPS4940B1ZO`, margin, 37);
      doc.text(`MOBILE- 8820416613`, pageWidth - margin, 37, { align: 'right' });

      // Add invoice details
      doc.line(margin, 39, pageWidth - margin, 39);
      doc.text(`Invoice No: ${data.invoiceNo}`, margin, 44);
      doc.text(`Invoice Date: ${data.invoiceDate}`, margin, 49);
      doc.text('State: WEST BENGAL    Code- 19', margin, 54);
      doc.text(`Transport Name: ${data.transportName}`, pageWidth / 2, 44);
      doc.text(`G.C.N./R.R.NO: ${data.gcn}`, pageWidth / 2, 49);
      doc.text(`Place of Supply: ${data.placeOfSupply}`, pageWidth / 2, 54);

      // Add receiver details
      doc.line(margin, 57, pageWidth - margin, 57);
      doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', pageWidth / 2, 62, { align: 'center' });
      doc.line(margin, 65, pageWidth - margin, 65);
      doc.text(`NAME: ${data.receiverName}`, margin, 70);
      doc.text(`ADDRESS: ${data.receiverAddress}`, margin, 75);
      doc.text(`GST IN: ${data.receiverGST}`, margin, 80);
      doc.text(`STATE: ${data.receiverState}`, margin, 85);
      doc.text(`CODE: ${data.receiverCode}`, margin + 65, 85);
      
      // Add table
      const tableColumn = ['S.NO', 'DESCRIPTION OF GOODS', 'HSN CODE', 'QNTY', 'RATE', 'AMOUNT (Rs)', 'AMOUNT (Paise)'];
      let tableRows = data.items.map((item, index) => {
        const amount = (item.quantity * item.rate).toFixed(2).split('.');
        return [
          index + 1,
          item.description,
          item.hsnCode,
          item.quantity,
          item.rate,
          amount[0], // Rupees
          amount[1] // Paise
        ];
      });
      
      // Ensure table has 15 rows
      while (tableRows.length < 15) {
        tableRows.push(['', '', '', '', '', '', '']);
      }
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 89, // Adjusted startY to push the table down
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 1, halign: 'center', lineColor: [2, 176, 252] }, // Center-align content and decrease cell padding
        headStyles: { fillColor: [173, 216, 230], textColor: 20, halign: "center" },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 65 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        },
        tableWidth: 'auto', // Adjusted to fit the table within the page width
        margin: { left: margin, right: margin }, // Added margin to fit the table within the page width
      });
      
      // Calculate totals
      if(data.cgst == null) {
        data.cgst = 0;
      }
      if(data.sgst == null) {
        data.sgst = 0;
      }
      if(data.igst == null) {
        data.igst = 0;
      }
      const totalAmountBeforeTax = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);
      const cgst = (totalAmountBeforeTax * parseInt(data.cgst) * 0.01).toFixed(2);
      const sgst = (totalAmountBeforeTax * parseInt(data.sgst) * 0.01).toFixed(2);
      const igst = (totalAmountBeforeTax * parseInt(data.igst) * 0.01).toFixed(2);
      const otherCharges = parseFloat(data.otherCharges) || 0;
      let totalAmountAfterTax = (parseFloat(totalAmountBeforeTax) + parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst) + otherCharges).toFixed(2);
      let totalAmountAfterRoundingOff = (parseFloat(roundOffValue(parseFloat(totalAmountAfterTax) || 0))).toFixed(2);
      const roundedOff = totalAmountAfterRoundingOff - totalAmountAfterTax;
      const totalAmountInWords = numberToWords(parseFloat(totalAmountAfterRoundingOff).toFixed(0));
      
      // Add totals and bank details
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(10);
      
      // Box for total amount before and after tax
      doc.rect(margin, finalY + 7, pageWidth - 2 * margin, 30);
      doc.text(`TOTAL AMOUNT BEFORE TAX: `, pageWidth / 2 , finalY + 11, { align: 'left' });
      doc.text(`${totalAmountBeforeTax}`, pageWidth - margin - 10, finalY + 11, { align: 'right' });

      doc.text(`ADD – CGST @ ${data.cgst}% : `, pageWidth / 2 , finalY + 15, { align: 'left' });
      doc.text(`${cgst}`, pageWidth - margin - 10, finalY + 15, { align: 'right' });

      doc.text(`ADD – SGST @ ${data.sgst}% : `, pageWidth / 2, finalY + 19, { align: 'left' });
      doc.text(`${sgst}`, pageWidth - margin - 10, finalY + 19, { align: 'right' });

      doc.text(`ADD – IGST @ ${data.igst}% :`, pageWidth / 2, finalY + 23, { align: 'left' });
      doc.text(`${igst}`, pageWidth - margin - 10, finalY + 23, { align: 'right' });

      doc.text(`BAGS: ${data.numberOfBags}`, margin + 5, finalY + 23, { align: 'left'});
      
      doc.text(`ADD – Other Charges: `, pageWidth / 2, finalY + 27, { align: 'left' });
      doc.text(`${otherCharges.toFixed(2)}`, pageWidth - margin - 10, finalY + 27, { align: 'right' });

      doc.text(`Rounded Off: `, pageWidth / 2, finalY + 31, { align: 'left' });
      doc.text(`${roundedOff.toFixed(2)}`, pageWidth - margin - 10, finalY + 31, { align: 'right' });

      doc.text(`TOTAL AMOUNT AFTER TAX: `, pageWidth / 2, finalY + 35, { align: 'left' });
      doc.text(`${totalAmountAfterRoundingOff}`, pageWidth - margin - 10, finalY + 35, { align: 'right' });

      // Box for total amount in words
      doc.rect(margin, finalY + 40, pageWidth - 2 * margin, 10);
      doc.text(`TOTAL INVOICE AMOUNT IN WORDS – ${totalAmountInWords.toUpperCase()}`, margin + 2, finalY + 46);

      // Box for bank details
      doc.rect(margin, finalY + 52, pageWidth - 2 * margin, 30);
      doc.text('BANK DETAILS', margin + 2, finalY + 58);
      doc.text(`BANK – ${data.bankDetails.bankName}`, margin + 2, finalY + 62);
      doc.text(`BRANCH – ${data.bankDetails.branch}`, margin + 2, finalY + 66);
      doc.text(`BANK A/C NO – ${data.bankDetails.accountNo}`, margin + 2, finalY + 70);
      doc.text(`BANK IFSC CODE – ${data.bankDetails.ifscCode}`, margin + 2, finalY + 74);

      doc.text('TERMS & CONDITIONS – PLEASE PAY BY A/C BY RTGS/NEFT/BANK TRANSFER.', margin, finalY + 86);
      doc.text('E. & O.E', pageWidth - margin - 26, finalY + 86, { align: 'left' });

      doc.text('AUTHORISED SIGNATORY', pageWidth - margin, pageHeight - margin + 5, { align: 'right' });
    });

    // Save the PDF
    doc.save(`${data.invoiceNo}_${data.receiverName}.pdf`);
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