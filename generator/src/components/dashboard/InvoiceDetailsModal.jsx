import { format } from 'date-fns';

const InvoiceDetailsModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  isDarkTheme, 
  onInvoiceUpdated 
}) => {
  if (!isOpen || !invoice) return null;

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

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const taxDetails = getTaxDetails();
    
    return subtotal + 
           (taxDetails.cgst || 0) + 
           (taxDetails.sgst || 0) + 
           (taxDetails.igst || 0) + 
           (taxDetails.other_charges || 0) - 
           (taxDetails.less_discount || 0) + 
           (taxDetails.rounded_off || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              📄 Invoice Details - {invoice.invoice_no}
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl font-bold ${
                isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                  {getTaxDetails().cgst > 0 && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        CGST:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(getTaxDetails().cgst)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().sgst > 0 && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        SGST:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(getTaxDetails().sgst)}
                      </span>
                    </div>
                  )}
                  {getTaxDetails().igst > 0 && (
                    <div className="flex justify-between">
                      <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                        IGST:
                      </span>
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(getTaxDetails().igst)}
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

        {/* Footer */}
        <div className={`p-4 border-t ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-md ${
                isDarkTheme
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement edit functionality
                console.log('Edit invoice:', invoice.id);
              }}
              className={`px-6 py-2 rounded-md ${
                isDarkTheme
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Edit Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
