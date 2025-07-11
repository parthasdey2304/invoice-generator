import { format } from 'date-fns';

const InvoiceTable = ({ 
  invoices, 
  loading, 
  pagination, 
  onPageChange, 
  onInvoiceClick, 
  onInvoiceDelete,
  isDarkTheme 
}) => {
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

  if (loading) {
    return (
      <div className={`rounded-lg shadow-sm border ${
        isDarkTheme 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxPages - 1);

    // Previous button
    if (pagination.page > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => onPageChange(pagination.page - 1)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            isDarkTheme
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            i === pagination.page
              ? isDarkTheme
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkTheme
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (pagination.page < pagination.pages) {
      pages.push(
        <button
          key="next"
          onClick={() => onPageChange(pagination.page + 1)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            isDarkTheme
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-6 py-4">
        <div className={`text-sm ${
          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} results
        </div>
        <div className="flex space-x-2">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg shadow-sm border ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-lg font-semibold ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          📋 Invoices ({pagination.total})
        </h3>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center">
          <div className={`text-4xl mb-4`}>📄</div>
          <h3 className={`text-lg font-medium ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No invoices found
          </h3>
          <p className={`text-sm ${
            isDarkTheme ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Create your first invoice to get started
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Invoice #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Items
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={`cursor-pointer transition-colors ${
                      isDarkTheme 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onInvoiceClick(invoice)}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {invoice.invoice_no}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {invoice.receivers?.name || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkTheme ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {invoice.invoice_items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-between space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInvoiceClick(invoice);
                          }}
                          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                            isDarkTheme
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                              : 'text-blue-600 hover:text-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInvoiceDelete(invoice);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors ml-auto"
                          title="Delete Invoice"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination.pages > 1 && renderPagination()}
        </>
      )}
    </div>
  );
};

export default InvoiceTable;
