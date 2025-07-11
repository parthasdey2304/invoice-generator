import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

// PDF Generation utility functions
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

const InvoiceDetailsModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  isDarkTheme, 
  onInvoiceUpdated 
}) => {
  const navigate = useNavigate();

  if (!isOpen || !invoice) return null;

  const handleGeneratePDF = () => {
    // Transform invoice data to the format expected by PDF generator
    const data = {
      invoiceNo: invoice.invoice_no,
      invoiceDate: invoice.invoice_date?.split('T')[0] || '',
      transportName: invoice.transport_name || '',
      gcn: invoice.gcn || '',
      placeOfSupply: invoice.place_of_supply || '',
      receiverName: invoice.receivers?.name || '',
      receiverAddress: invoice.receivers?.address || '',
      receiverGST: invoice.receivers?.gst || '',
      receiverState: invoice.receivers?.state || '',
      receiverCode: invoice.receivers?.code || '',
      items: invoice.invoice_items?.map(item => ({
        description: item.description || '',
        hsnCode: item.hsn_code || '',
        quantity: item.quantity || 0,
        rate: item.rate || 0
      })) || [],
      numberOfBags: invoice.number_of_bags || '',
      pdfLink: invoice.pdf_link || '',
      bankDetails: {
        bankName: invoice.bank_details?.[0]?.bank_name || 'STATE BANK OF INDIA',
        branch: invoice.bank_details?.[0]?.branch || 'TANGRA',
        accountNo: invoice.bank_details?.[0]?.account_no || '43776936082',
        ifscCode: invoice.bank_details?.[0]?.ifsc_code || 'SBIN0003737',
      },
      // Flatten tax details for PDF generator
      cgst: invoice.tax_details?.[0]?.cgst?.toString() || '0',
      sgst: invoice.tax_details?.[0]?.sgst?.toString() || '0',
      igst: invoice.tax_details?.[0]?.igst?.toString() || '0',
      otherCharges: invoice.tax_details?.[0]?.other_charges?.toString() || '0',
      lessDiscount: invoice.tax_details?.[0]?.less_discount?.toString() || '0',
      roundedOff: invoice.tax_details?.[0]?.rounded_off?.toString() || '0',
      showCgst: invoice.tax_details?.[0]?.show_cgst || false,
      showSgst: invoice.tax_details?.[0]?.show_sgst || false,
      showIgst: invoice.tax_details?.[0]?.show_igst || false,
      showOtherCharges: invoice.tax_details?.[0]?.show_other_charges || false,
      showLessDiscount: invoice.tax_details?.[0]?.show_less_discount || false,
      showRoundedOff: invoice.tax_details?.[0]?.show_rounded_off || false,
    };

    // Generate PDF directly here without navigation
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

  const handleEditInvoice = () => {
    // Transform invoice data back to form format
    const formData = {
      invoiceNo: invoice.invoice_no,
      invoiceDate: invoice.invoice_date?.split('T')[0] || '', // Convert to YYYY-MM-DD format
      transportName: invoice.transport_name || '',
      gcn: invoice.gcn || '',
      placeOfSupply: invoice.place_of_supply || '',
      receiverName: invoice.receivers?.name || '',
      receiverAddress: invoice.receivers?.address || '',
      receiverGST: invoice.receivers?.gst || '',
      receiverState: invoice.receivers?.state || '',
      receiverCode: invoice.receivers?.code || '',
      items: invoice.invoice_items?.map(item => ({
        description: item.description || '',
        hsnCode: item.hsn_code || '',
        quantity: item.quantity || '',
        rate: item.rate || ''
      })) || [{ description: '', hsnCode: '853810', quantity: '', rate: '' }],
      numberOfBags: invoice.number_of_bags || '',
      pdfLink: invoice.pdf_link || '',
      bankDetails: {
        bankName: invoice.bank_details?.[0]?.bank_name || 'STATE BANK OF INDIA',
        branch: invoice.bank_details?.[0]?.branch || 'TANGRA',
        accountNo: invoice.bank_details?.[0]?.account_no || '43776936082',
        ifscCode: invoice.bank_details?.[0]?.ifsc_code || 'SBIN0003737',
      },
      taxDetails: {
        cgst: invoice.tax_details?.[0]?.cgst?.toString() || '0',
        sgst: invoice.tax_details?.[0]?.sgst?.toString() || '0',
        igst: invoice.tax_details?.[0]?.igst?.toString() || '0',
        otherCharges: invoice.tax_details?.[0]?.other_charges?.toString() || '0',
        lessDiscount: invoice.tax_details?.[0]?.less_discount?.toString() || '0',
        roundedOff: invoice.tax_details?.[0]?.rounded_off?.toString() || '0',
        showCgst: invoice.tax_details?.[0]?.show_cgst || false,
        showSgst: invoice.tax_details?.[0]?.show_sgst || false,
        showIgst: invoice.tax_details?.[0]?.show_igst || false,
        showOtherCharges: invoice.tax_details?.[0]?.show_other_charges || false,
        showLessDiscount: invoice.tax_details?.[0]?.show_less_discount || false,
        showRoundedOff: invoice.tax_details?.[0]?.show_rounded_off || false,
      }
    };
    
    // Store the data in localStorage for the form to pick up
    localStorage.setItem('editInvoiceData', JSON.stringify({
      ...formData,
      isEdit: true,
      originalId: invoice.id
    }));
    
    // Close modal and navigate to form
    onClose();
    navigate('/');
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.rate || 0);
  };

  const calculateSubtotal = () => {
    return invoice.invoice_items?.reduce((sum, item) => sum + calculateItemTotal(item), 0) || 0;
  };

  const getTaxDetails = () => {
    return invoice.tax_details?.[0] || {};
  };

  const calculateTaxAmounts = () => {
    const subtotal = calculateSubtotal();
    const taxDetails = getTaxDetails();
    
    return {
      cgst: (subtotal * (taxDetails.cgst || 0) / 100),
      sgst: (subtotal * (taxDetails.sgst || 0) / 100), 
      igst: (subtotal * (taxDetails.igst || 0) / 100)
    };
  };

  const calculateGrandTotal = () => {
    // Use the stored total_amount from database if available
    // Otherwise calculate: subtotal + calculated taxes + other charges - discounts
    if (invoice.total_amount) {
      return invoice.total_amount;
    }
    
    const subtotal = calculateSubtotal();
    const taxDetails = getTaxDetails();
    const taxAmounts = calculateTaxAmounts();
    
    return subtotal + 
           taxAmounts.cgst + 
           taxAmounts.sgst + 
           taxAmounts.igst + 
           (taxDetails.other_charges || 0) - 
           (taxDetails.less_discount || 0) + 
           (taxDetails.rounded_off || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] flex flex-col rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header - Fixed */}
        <div className={`p-4 sm:p-6 border-b flex-shrink-0 ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-lg sm:text-2xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              📄 Invoice Details - {invoice.invoice_no}
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl font-bold p-1 ${
                isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Invoice Information */}
              <div className={`p-4 rounded-lg ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Invoice Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Invoice Number:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.invoice_no}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Date:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatDate(invoice.invoice_date)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Transport:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.transport_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        GCN:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.gcn || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Place of Supply:
                    </span>
                    <p className={`font-medium ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {invoice.place_of_supply || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className={`p-4 rounded-lg ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Name:
                    </span>
                    <p className={`font-medium ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {invoice.receivers?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Address:
                    </span>
                    <p className={`font-medium ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {invoice.receivers?.address || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        GST IN:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.receivers?.gst_in || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        State:
                      </span>
                      <p className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.receivers?.state || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Items */}
              <div className={`p-4 rounded-lg ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Items ({invoice.invoice_items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {invoice.invoice_items?.map((item, index) => (
                    <div key={index} className={`p-3 rounded border ${
                      isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="col-span-2">
                          <span className={`font-medium ${
                            isDarkTheme ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.description}
                          </span>
                        </div>
                        <div>
                          <span className={`${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <div>
                          <span className={`${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Rate: {formatCurrency(item.rate)}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`font-medium ${
                            isDarkTheme ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Total: {formatCurrency(calculateItemTotal(item))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Summary */}
              <div className={`p-4 rounded-lg ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Tax Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                      Subtotal:
                    </span>
                    <span className={`font-medium ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  {getTaxDetails().show_cgst && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        CGST @ {getTaxDetails().cgst || 0}%:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(calculateTaxAmounts().cgst)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().show_sgst && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        SGST @ {getTaxDetails().sgst || 0}%:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(calculateTaxAmounts().sgst)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().show_igst && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        IGST @ {getTaxDetails().igst || 0}%:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(calculateTaxAmounts().igst)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().show_other_charges && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        Other Charges:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(getTaxDetails().other_charges || 0)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().show_less_discount && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        Less Discount:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-red-400' : 'text-red-600'
                      }`}>
                        -{formatCurrency(getTaxDetails().less_discount || 0)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().show_rounded_off && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        Rounded Off:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(getTaxDetails().rounded_off || 0)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className={`font-semibold ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        Grand Total:
                      </span>
                      <span className={`font-bold text-lg ${
                        isDarkTheme ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {formatCurrency(calculateGrandTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons (Sticky) */}
        <div className={`flex-shrink-0 p-4 sm:p-6 border-t ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${
                isDarkTheme
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleGeneratePDF}
              className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${
                isDarkTheme
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              📄 Generate PDF
            </button>
            <button
              onClick={handleEditInvoice}
              className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${
                isDarkTheme
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              ✏️ Edit Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
