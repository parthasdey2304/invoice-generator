import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Base64 encoded string of the Cambria Math font
const cambriaMathFont = "data:font/truetype;base64,..."; // Your base64 string goes here

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
    if (!n) return ''; // Return an empty string if the number is invalid
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

    // Add the custom font
    doc.addFileToVFS("CambriaMath.ttf", cambriaMathFont);
    doc.addFont("CambriaMath.ttf", "CambriaMath", "normal");
    doc.setFont("CambriaMath");

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
    doc.line(12, 50, 202, 50)
    doc.text(`Invoice No: ${data.invoiceNo}`, 14, 55);
    doc.text(`Invoice Date: ${data.invoiceDate}`, 14, 61);
    doc.text('State: WEST BENGAL    Code- 19', 14, 67);
    doc.text(`Transport Name: ${data.transportName}`, 110, 55);
    doc.text(`G.C.N./R.R.NO: ${data.gcn}`, 110, 61);
    doc.text(`Place of Supply: ${data.placeOfSupply}`, 110, 67);

    doc.line(12, 70, 202, 70);
    doc.line(12, 50, 12, 105);
    doc.line(202, 50, 202, 105);
    
    // Adding receiver details
    doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', 60, 76);
    doc.line(12,79, 202, 79);
    doc.text(`NAME: ${data.receiverName}`, 14, 84);
    doc.text(`ADDRESS: ${data.receiverAddress}`, 14, 90);
    doc.text(`GST IN: ${data.receiverGST}`, 14, 96);
    doc.text(`STATE: ${data.receiverState}`, 14, 102);
    doc.text(`CODE: ${data.receiverCode}`, 70, 102);
    
    doc.line(12, 105, 202, 105);

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

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      pageBreak: 'auto',
      tableWidth: 'auto',
      rowPageBreak: 'auto',
      rowHeight: 10,
      margin: { top: 110 },
      bodyStyles: { valign: 'top' },
      styles: { overflow: 'linebreak', cellWidth: 'auto', minCellHeight: 15 },
      didDrawPage: (data) => {
        let rowsPerPage = 15;
        let startRow = data.settings.startY + 10;
        let endRow = startRow + (rowsPerPage * data.table.body[0].height);
        if (data.table.finalY > endRow) {
          doc.addPage();
          data.table.finalY = startRow;
        }
      }
    });

    // Calculate totals
    const totalAmountBeforeTax = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);
    const cgst = (totalAmountBeforeTax * 0.09).toFixed(2);
    const igst = (totalAmountBeforeTax * 0.09).toFixed(2);
    const totalAmountAfterTax = (parseFloat(totalAmountBeforeTax) + parseFloat(cgst) + parseFloat(igst)).toFixed(2);
    const totalAmountInWords = numberToWords(parseFloat(totalAmountAfterTax).toFixed(0)); // Convert number to integer for words

    // Adding the bank details and totals
    if (totalAmountInWords) {
      doc.text(`TOTAL INVOICE AMOUNT IN WORDS – ${totalAmountInWords.toUpperCase()}`, 14, doc.lastAutoTable.finalY + 10);
    } else {
      doc.text('TOTAL INVOICE AMOUNT IN WORDS – ERROR CONVERTING NUMBER TO WORDS', 14, doc.lastAutoTable.finalY + 10);
    }
    doc.text(`TOTAL AMOUNT BEFORE TAX: ${totalAmountBeforeTax}`, 100, doc.lastAutoTable.finalY + 20);

    doc.text('BANK DETAILS', 14, doc.lastAutoTable.finalY + 16);
    doc.text(`BANK – ${data.bankDetails.bankName}`, 14, doc.lastAutoTable.finalY + 22);
    doc.text(`BRANCH – ${data.bankDetails.branch}`, 14, doc.lastAutoTable.finalY + 28);
    doc.text(`BANK A/C NO – ${data.bankDetails.accountNo}`, 14, doc.lastAutoTable.finalY + 34);
    doc.text(`BANK IFSC CODE – ${data.bankDetails.ifscCode}`, 14, doc.lastAutoTable.finalY + 40);

    doc.text(`ADD – CGST @ 9%: ${cgst}`, 100, doc.lastAutoTable.finalY + 26);
    doc.text(`ADD – IGST @ 9%: ${igst}`, 100, doc.lastAutoTable.finalY + 32);
    doc.text('TOTAL AMOUNT AFTER TAX', 100, doc.lastAutoTable.finalY + 38);
    doc.text(`TOTAL AMOUNT AFTER TAX: ${totalAmountAfterTax}`, 100, doc.lastAutoTable.finalY + 44);

    doc.text('TERMS & CONDITIONS – PLEASE PAY BY A/C BY RTGS/NEFT/BANK TRANSFER.', 14, doc.lastAutoTable.finalY + 56);
    doc.text('E. & O.E', 168, doc.lastAutoTable.finalY + 62);

    doc.text('AUTHORISED SIGNATORY', 150, doc.lastAutoTable.finalY + 83);

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
