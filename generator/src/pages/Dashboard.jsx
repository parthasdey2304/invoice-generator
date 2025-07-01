import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import InvoiceTable from '../components/dashboard/InvoiceTable.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import FilterBar from '../components/dashboard/FilterBar.jsx';
import InvoiceDetailsModal from '../components/dashboard/InvoiceDetailsModal.jsx';
import { useNotification } from '../components/NotificationProvider.jsx';

const Dashboard = () => {
  const { showError, showSuccess, showWarning } = useNotification();
  
  // Use global dark mode state
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  // Listen for theme changes from Navigation component
  useEffect(() => {
    const handleThemeChange = (event) => {
      setIsDarkTheme(event.detail);
    };

    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      setIsDarkTheme(saved !== null ? JSON.parse(saved) : false);
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component mount
    handleStorageChange();
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customer: '',
    minAmount: '',
    maxAmount: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [pagination.page, pagination.limit, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {      // Load invoices
      const invoicesResult = await invoiceService.getInvoices(
        pagination.page,
        pagination.limit,
        filters
      );
        if (invoicesResult.success) {
        console.log('Dashboard: Invoices loaded:', invoicesResult.data.length);
        console.log('Dashboard: Sample invoice:', invoicesResult.data[0]);
        setInvoices(invoicesResult.data);
        setPagination(invoicesResult.pagination);
      } else {
        showError('Failed to load invoices');
      }

      // Load analytics
      const analyticsResult = await invoiceService.getDashboardAnalytics();
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      } else {
        showError('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleInvoiceClick = async (invoice) => {
    const result = await invoiceService.getInvoiceById(invoice.id);
    if (result.success) {
      setSelectedInvoice(result.data);
      setIsDetailsModalOpen(true);
    }
  };
  const handleExportCSV = async () => {
    try {
      showSuccess('Preparing CSV export...');
      
      // Get all invoices (not just current page)
      const allInvoicesResult = await invoiceService.getInvoices(1, 1000, filters);
      
      if (!allInvoicesResult.success) {
        showError('Failed to fetch data for export');
        return;
      }

      const csvData = allInvoicesResult.data.map(invoice => ({
        'Invoice No': invoice.invoice_no,
        'Date': invoice.invoice_date,
        'Customer': invoice.receivers?.name || 'N/A',
        'Customer Address': invoice.receivers?.address || 'N/A',
        'GST Number': invoice.receivers?.gst_in || 'N/A',
        'State': invoice.receivers?.state || 'N/A',
        'Transport': invoice.transport_name || 'N/A',
        'GCN': invoice.gcn || 'N/A',
        'Place of Supply': invoice.place_of_supply || 'N/A',
        'Number of Bags': invoice.number_of_bags || 0,
        'Total Amount': invoice.total_amount || 0,
        'Items Count': invoice.invoice_items?.length || 0,
        'CGST': invoice.tax_details?.cgst || 0,
        'SGST': invoice.tax_details?.sgst || 0,
        'IGST': invoice.tax_details?.igst || 0,
        'Created At': invoice.created_at
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('CSV exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export CSV');
    }
  };
  return (
    <div className={`min-h-screen font-poppins ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            📊 Invoice Dashboard
          </h1>
          <p className={`mt-2 ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage and analyze your invoices
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards 
          analytics={analytics} 
          loading={loading}
          isDarkTheme={isDarkTheme}
        />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onExportCSV={handleExportCSV}
          isDarkTheme={isDarkTheme}
        />

        {/* Invoice Table */}
        <InvoiceTable
          invoices={invoices}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onInvoiceClick={handleInvoiceClick}
          isDarkTheme={isDarkTheme}
        />

        {/* Invoice Details Modal */}
        <InvoiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          invoice={selectedInvoice}
          isDarkTheme={isDarkTheme}
          onInvoiceUpdated={loadDashboardData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
