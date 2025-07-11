import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

    // Store the data and navigate to home page where PDF will be generated
    localStorage.setItem('generatePDFData', JSON.stringify(data));
    
    // Close modal and navigate to form page where PDF generation will happen
    onClose();
    navigate('/');
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
