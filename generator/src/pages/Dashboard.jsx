import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import InvoiceTable from '../components/dashboard/InvoiceTable.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import FilterBar from '../components/dashboard/FilterBar.jsx';
import InvoiceDetailsModal from '../components/dashboard/InvoiceDetailsModal.jsx';
import { useNotification } from '../components/NotificationProvider.jsx';

const Dashboard = () => {
  const { error: showError } = useNotification();
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
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
    try {      // Load invoices (using simplified version to avoid join issues)
      const invoicesResult = await invoiceService.getInvoicesSimple(
        pagination.page,
        pagination.limit,
        filters
      );
      
      if (invoicesResult.success) {
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

  const handleExportCSV = () => {
    // This will be implemented with the CSV export functionality
    console.log('Exporting CSV...');
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
