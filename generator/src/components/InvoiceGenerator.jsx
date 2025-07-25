import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

function formatDateToDDMMYYYY(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function numberToWords(num) {
  const lessThanTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                          "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", 
                          "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const thousands = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero";

  let i = 0;
  let words = "";

  while (num > 0) {
    let divisor = i === 1 ? 100 : 1000;  // Use 100 for thousands place, 1000 for higher places
    if (num % divisor !== 0) {
      words = convertHundred(num % divisor) + thousands[i] + " " + words;
    }
    num = Math.floor(num / divisor);
    i++;
  }

  return words.trim() + " Only";
}

function convertHundred(num) {
  const lessThanTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                          "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", 
                          "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  let str = "";

  if (num >= 100) {
    str += lessThanTwenty[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += lessThanTwenty[num] + " ";
  }
  return str;
}


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
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });
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
    
      // Set background color to white for all copies
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Set stroke color to light blue, yellow and pink respectively for the different copies
      if(index == 3) {
        doc.setDrawColor(255, 180, 75);
      } else if(index == 4) {
        doc.setDrawColor(238, 130, 238);
      } else {
        doc.setDrawColor(2, 176, 252);
      }

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
      doc.text('EMAIL: ashokkumarshaw1103@gmail.com', pageWidth / 2 - 30, 37);
      doc.text(`MOBILE- 8820416613`, pageWidth - margin, 37, { align: 'right' });

      // Add invoice details
      doc.line(margin, 39, pageWidth - margin, 39);
      doc.text(`Invoice No: ${data.invoiceNo}`, margin, 44);
      doc.text(`Invoice Date: ${formatDateToDDMMYYYY(data.invoiceDate)}`, margin, 49);
      doc.text('State: WEST BENGAL    Code- 19', margin, 54);
      doc.text(`Transport Name: ${data.transportName.toUpperCase()}`, pageWidth / 2, 44);
      doc.text(`G.C.N./R.R.NO: ${data.gcn}`, pageWidth / 2, 49);
      doc.text(`Place of Supply: ${data.placeOfSupply.toUpperCase()}`, pageWidth / 2, 54);

      // Add receiver details
      doc.line(margin, 57, pageWidth - margin, 57);
      doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', pageWidth / 2, 62, { align: 'center' });
      doc.line(margin, 65, pageWidth - margin, 65);
      doc.text(`NAME: ${data.receiverName.toUpperCase()}`, margin, 70);
      doc.text(`ADDRESS: ${data.receiverAddress.toUpperCase()}`, margin, 75);
      doc.text(`GST IN: ${data.receiverGST}`, margin, 80);
      doc.text(`STATE: ${data.receiverState.toUpperCase()}`, margin, 85);
      doc.text(`CODE: ${data.receiverCode}`, margin + 65, 85);
      
      // Add table
      const tableColumn = ['S.NO', 'DESCRIPTION OF GOODS', 'HSN CODE', 'QNTY', 'RATE', 'AMOUNT (Rs)', 'PAISE'];
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
      
      // Ensure table has 15 rows and add [GOLD NUT] in the last row
      while (tableRows.length < 15) {
        tableRows.push(['', '', '', '', '', '', '']);
      }
      
      // Add [GOLD NUT] in the last row's description column
      if (tableRows.length >= 15) {
        tableRows[14][1] = '[GOLD NUT]'; // Set description of the 15th row (index 14) to [GOLD NUT]
      }
      
      // Set table line color based on the copy type
      let tableLineColor;
      if (index < 3) {
        // Light blue color for the Buyer's copy
        tableLineColor = [2, 176, 252];
      } else if (index === 3) {
        // Lighter yellow for Seller's copy
        tableLineColor = [255, 180, 75];
      } else {
        // Lighter pink for Transport's copy
        tableLineColor = [238, 130, 238];
      }
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 89,
        theme: 'grid',
        styles: { 
          fontSize: 10, 
          cellPadding: 1, 
          halign: 'center', 
          lineColor: tableLineColor,
          fillColor: [255, 255, 255]
        },
        headStyles: { 
          fillColor: tableLineColor, 
          textColor: 20, 
          halign: "center" 
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 15 },
        },
        tableWidth: 'auto',
        margin: { left: margin, right: margin },
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
      let totalAmountBeforeTax = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);
      let cgst = (totalAmountBeforeTax * (parseFloat(data.cgst) || 0) * 0.01).toFixed(2);
      let sgst = (totalAmountBeforeTax * (parseFloat(data.sgst) || 0) * 0.01).toFixed(2);
      let igst = (totalAmountBeforeTax * (parseFloat(data.igst) || 0) * 0.01).toFixed(2);
      let otherCharges = parseFloat(data.otherCharges) || 0;
      let lessDiscount = Math.abs(parseFloat(data.lessDiscount) || 0);
      let totalAmountAfterTax = (parseFloat(totalAmountBeforeTax) + parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst) + otherCharges - lessDiscount).toFixed(2);
      let totalAmountAfterRoundingOff = (parseFloat(roundOffValue(parseFloat(totalAmountAfterTax) || 0))).toFixed(2);
      let roundedOff =(totalAmountAfterRoundingOff - totalAmountAfterTax);

      let totalAmountInWords = numberToWords(parseFloat(totalAmountAfterRoundingOff).toFixed(0));
      
      // Add totals and bank details
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(13);
      
      // Box for total amount before and after tax
      doc.rect(margin, finalY, pageWidth - 2 * margin, 37);
      
      doc.text(`BAGS: ${data.numberOfBags}`, margin + 80, finalY + 7, { align: 'left'});
      doc.setFontSize(10);
      doc.text("TOTAL INVOICE AMOUNT IN WORDS : ", margin + 3, finalY + 18);
      const totalAmountInWordsWrapped = doc.splitTextToSize(`${totalAmountInWords.toUpperCase()}`, pageWidth / 2 - margin - 6);
      doc.text(totalAmountInWordsWrapped, margin + 3, finalY + 23);

      doc.setFontSize(8);
      doc.line(pageWidth / 2 + 8, finalY, pageWidth / 2 + 8, finalY + 37);
      doc.line(pageWidth / 2 + 60, finalY, pageWidth / 2 + 60, finalY + 37);
      doc.line(pageWidth / 2 + 80, finalY, pageWidth / 2 + 80, finalY + 37);

      doc.setLineWidth(0.1);
      doc.line(pageWidth / 2 + 8, finalY + 6.5, pageWidth - margin, finalY + 6.5);
      doc.line(pageWidth / 2 + 8, finalY + 11.5, pageWidth - margin, finalY + 11.5);
      doc.line(pageWidth / 2 + 8, finalY + 16.5, pageWidth - margin, finalY + 16.5);
      doc.line(pageWidth / 2 + 8, finalY + 21.5, pageWidth - margin, finalY + 21.5);
      doc.line(pageWidth / 2 + 8, finalY + 26.5, pageWidth - margin, finalY + 26.5);
      doc.line(pageWidth / 2 + 8, finalY + 31.5, pageWidth - margin, finalY + 31.5);

      doc.setFontSize(9);
      doc.text("TOTAL AMOUNT BEFORE TAX: ", pageWidth / 2 + 10 , finalY + 5, { align: 'left' });
      doc.text(`${totalAmountBeforeTax.split('.')[0]}`, pageWidth - margin - 20, finalY + 5, { align: 'right' });
      doc.text(`${totalAmountBeforeTax.split('.')[1]}`, pageWidth - margin - 5, finalY + 5, { align: 'right' });

      let currentLineOffset = 10;

      // Show CGST if the checkbox is checked (even if value is 0)
      if (data.showCgst) {
        doc.text(`ADD – CGST @ ${data.cgst || 0}% : `, pageWidth / 2 + 10 , finalY + currentLineOffset, { align: 'left' });
        doc.text(`${cgst.split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${cgst.split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      // Show SGST if the checkbox is checked (even if value is 0)
      if (data.showSgst) {
        doc.text(`ADD – SGST @ ${data.sgst || 0}% : `, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
        doc.text(`${sgst.split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${sgst.split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      // Show IGST if the checkbox is checked (even if value is 0)
      if (data.showIgst) {
        doc.text(`ADD – IGST @ ${data.igst || 0}% :`, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
        doc.text(`${igst.split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${igst.split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      // Show Other Charges if checkbox is checked (even if value is 0)
      if (data.showOtherCharges) {
        doc.text(`ADD – Other Charges: `, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
        doc.text(`${otherCharges.toFixed(2).split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${otherCharges.toFixed(2).split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      // Show Less Discount if toggle is set to Less Discount
      if (data.showLessDiscount) {
        doc.text(`LESS DISCOUNT: `, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
        doc.text(`-${lessDiscount.toFixed(2).split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${lessDiscount.toFixed(2).split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      // Show Rounded Off if toggle is set to Rounded Off
      if (data.showRoundedOff) {
        doc.text(`ROUNDED OFF: `, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
        doc.text(`${roundedOff.toFixed(2).split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
        doc.text(`${roundedOff.toFixed(2).split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });
        currentLineOffset += 5;
      }

      doc.text(`TOTAL AMOUNT AFTER TAX: `, pageWidth / 2 + 10, finalY + currentLineOffset, { align: 'left' });
      doc.text(`${totalAmountAfterRoundingOff.split('.')[0]}`, pageWidth - margin - 20, finalY + currentLineOffset, { align: 'right' });
      doc.text(`${totalAmountAfterRoundingOff.split('.')[1]}`, pageWidth - margin - 5, finalY + currentLineOffset, { align: 'right' });

      // Box for bank details - adjust position based on currentLineOffset
      const bankDetailsY = finalY + currentLineOffset + 10;
      doc.setFontSize(11);
      doc.rect(margin, bankDetailsY, pageWidth - 2 * margin, 30);
      doc.text('BANK DETAILS', margin + 2, bankDetailsY + 6);
      doc.text(`BANK – ${data.bankDetails.bankName}`, margin + 2, bankDetailsY + 11);
      doc.text(`BRANCH – ${data.bankDetails.branch}`, margin + 2, bankDetailsY + 16);
      doc.text(`BANK A/C NO – ${data.bankDetails.accountNo}`, margin + 2, bankDetailsY + 21);
      doc.text(`BANK IFSC CODE – ${data.bankDetails.ifscCode}`, margin + 2, bankDetailsY + 26);

      QRCode.toDataURL(data.pdfLink, { width: 100, margin: 1 }, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return;
        }
        
        doc.text("SCAN HERE", pageWidth - margin - 40, bankDetailsY + 10, { align: 'right' });
        doc.text("FOR PRODUCT DETAILS", pageWidth - margin - 30, bankDetailsY + 20, { align: 'right' });
        doc.addImage(url, 'PNG', pageWidth - margin - 28, bankDetailsY + 2, 26, 26);
      });

      doc.text('TERMS & CONDITIONS – PLEASE PAY BY A/C BY RTGS/NEFT/BANK TRANSFER.', margin, bankDetailsY + 37);
      doc.text('E. & O.E', pageWidth - margin - 30, bankDetailsY + 37, { align: 'left' });

      doc.text('AUTHORISED SIGNATORY', pageWidth - margin, pageHeight - margin + 2, { align: 'right' });
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
