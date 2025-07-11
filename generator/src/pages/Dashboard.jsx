import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import InvoiceTable from '../components/dashboard/InvoiceTable.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import FilterBar from '../components/dashboard/FilterBar.jsx';
import InvoiceDetailsModal from '../components/dashboard/InvoiceDetailsModal.jsx';
import DeleteConfirmationModal from '../components/dashboard/DeleteConfirmationModal.jsx';
import { useNotification } from '../components/NotificationProvider.jsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
  const { error: showError, success: showSuccess, warning: showWarning } = useNotification();
  
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [pagination.page, pagination.limit, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Starting loadDashboardData...');
      
      // Load invoices
      const invoicesResult = await invoiceService.getInvoices(
        pagination.page,
        pagination.limit,
        filters
      );
      
      console.log('Invoices result:', invoicesResult);
      
      if (invoicesResult.success) {
        console.log('Dashboard: Invoices loaded:', invoicesResult.data.length);
        console.log('Dashboard: Sample invoice:', invoicesResult.data[0]);
        setInvoices(invoicesResult.data);
        setPagination(invoicesResult.pagination);
      } else {
        console.error('Failed to load invoices:', invoicesResult.error);
        showError('Failed to load invoices');
      }

      // Load analytics
      console.log('Loading analytics...');
      const analyticsResult = await invoiceService.getDashboardAnalytics();
      console.log('Analytics result:', analyticsResult);
      
      if (analyticsResult.success) {
        console.log('Dashboard: Analytics loaded:', analyticsResult.data);
        setAnalytics(analyticsResult.data);
      } else {
        console.error('Dashboard: Analytics error:', analyticsResult.error);
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

  const handleInvoiceDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      // Optimistically remove from UI for immediate feedback
      const originalInvoices = [...invoices];
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      
      const result = await invoiceService.deleteInvoice(invoiceToDelete.id);
      
      if (result.success) {
        showSuccess('Invoice deleted successfully!');
        
        // Check if we need to go to previous page
        const currentPageItemCount = originalInvoices.length;
        const shouldGoToPreviousPage = currentPageItemCount === 1 && pagination.page > 1;
        
        if (shouldGoToPreviousPage) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Reload the dashboard data to ensure consistency and update analytics
          await loadDashboardData();
        }
        
        // Close modal after operations complete
        setIsDeleteModalOpen(false);
        setInvoiceToDelete(null);
      } else {
        // Revert optimistic update on failure
        setInvoices(originalInvoices);
        showError('Failed to delete invoice: ' + result.error);
        setIsDeleteModalOpen(false);
        setInvoiceToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      // Revert optimistic update on error
      await loadDashboardData();
      showError('Error deleting invoice. Please try again.');
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };
  const handleExportTaxPDF = async () => {
    try {
      showSuccess('Preparing Tax PDF export...');
      
      // Get all invoices with filters applied - need to include tax details with show flags
      const allInvoicesResult = await invoiceService.getInvoices(1, 1000, filters);
      
      if (!allInvoicesResult.success) {
        showError('Failed to fetch data for export');
        return;
      }

      const invoicesData = allInvoicesResult.data;
      
      if (invoicesData.length === 0) {
        showWarning('No invoices found with current filters');
        return;
      }

      // Create PDF with professional styling like InvoiceGenerator
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 5; // Minimum margin for maximum table width

      // Set background color to white
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header styling like InvoiceGenerator with Times New Roman
      doc.setDrawColor(2, 176, 252); // Light blue border
      doc.setLineWidth(0.5);
      
      // Company header with Times New Roman
      doc.setFontSize(20);
      doc.setFont('times', 'bold');
      doc.text('M/S RAM DHANI SHAW', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('TAX REVENUE REPORT', pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text('PROPRIETOR: ASHOK KUMAR SHAW', pageWidth / 2, 35, { align: 'center' });
      doc.text('31/A PULIN KHATICK ROAD KOLKATA – 700015', pageWidth / 2, 40, { align: 'center' });
      doc.text('GST IN: 19AKWPS4940B1ZO | EMAIL: ashokkumarshaw1103@gmail.com | MOBILE: 8820416613', pageWidth / 2, 45, { align: 'center' });

      // Add horizontal line
      doc.line(margin, 48, pageWidth - margin, 48);
      
      // Report details
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      let reportInfo = 'Generated on: ' + new Date().toLocaleDateString();
      if (filters.startDate && filters.endDate) {
        reportInfo += ` | Period: ${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`;
      }
      if (filters.customer) {
        reportInfo += ` | Customer: ${filters.customer}`;
      }
      if (filters.minAmount || filters.maxAmount) {
        reportInfo += ` | Amount Range: ₹${filters.minAmount || 0} - ₹${filters.maxAmount || '∞'}`;
      }
      doc.text(reportInfo, pageWidth / 2, 55, { align: 'center' });

      // Add another line
      doc.line(margin, 58, pageWidth - margin, 58);

      // Prepare table data with proper tax details access
      const tableData = invoicesData.map(invoice => {
        // Calculate subtotal from items
        const itemsTotal = (invoice.invoice_items || []).reduce((sum, item) => {
          return sum + ((item.quantity || 0) * (item.rate || 0));
        }, 0);

        // Get tax details - handle both object and array formats
        let taxDetails = {};
        if (Array.isArray(invoice.tax_details)) {
          taxDetails = invoice.tax_details[0] || {};
        } else {
          taxDetails = invoice.tax_details || {};
        }
        
        // Calculate actual tax amounts with proper access
        const cgstAmount = taxDetails.show_cgst ? (itemsTotal * (taxDetails.cgst || 0) / 100) : 0;
        const sgstAmount = taxDetails.show_sgst ? (itemsTotal * (taxDetails.sgst || 0) / 100) : 0;
        const igstAmount = taxDetails.show_igst ? (itemsTotal * (taxDetails.igst || 0) / 100) : 0;

        // Format items list (truncate if too long for portrait)
        const itemsList = (invoice.invoice_items || [])
          .map(item => `${item.description}`)
          .join(', ');
        const truncatedItems = itemsList.length > 25 ? itemsList.substring(0, 22) + '...' : itemsList;

        // Calculate total revenue (items total + all taxes)
        const totalRevenue = itemsTotal + cgstAmount + sgstAmount + igstAmount;

        return [
          invoice.invoice_no || 'N/A',
          invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-IN') : 'N/A',
          (invoice.receivers?.name || 'N/A').length > 15 ? 
            (invoice.receivers?.name || 'N/A').substring(0, 12) + '...' : 
            (invoice.receivers?.name || 'N/A'),
          truncatedItems || 'No items',
          itemsTotal.toFixed(2),
          cgstAmount > 0 ? cgstAmount.toFixed(2) : '-',
          sgstAmount > 0 ? sgstAmount.toFixed(2) : '-',
          igstAmount > 0 ? igstAmount.toFixed(2) : '-',
          totalRevenue.toFixed(2) // Total Revenue column
        ];
      });

      // Calculate available width for table
      const availableWidth = pageWidth - (2 * margin); // 210 - 10 = 200mm available for portrait
      
      // Professional table styling with Times New Roman font
      doc.autoTable({
        head: [['Invoice No', 'Date', 'Customer', 'Items', 'Amount (₹)', 'CGST (₹)', 'SGST (₹)', 'IGST (₹)', 'Total Revenue (₹)']],
        body: tableData,
        startY: 65,
        theme: 'grid',
        styles: { 
          fontSize: 6, // Further reduced font size for portrait
          cellPadding: 0.8,
          halign: 'center',
          lineColor: [2, 176, 252],
          lineWidth: 0.1,
          fillColor: [255, 255, 255],
          font: 'times'
        },
        headStyles: { 
          fillColor: [2, 176, 252],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7,
          font: 'times'
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' }, // Invoice No
          1: { cellWidth: 18, halign: 'center' }, // Date
          2: { cellWidth: 28, halign: 'left' },   // Customer
          3: { cellWidth: 40, halign: 'left' },   // Items
          4: { cellWidth: 20, halign: 'right' },  // Amount
          5: { cellWidth: 16, halign: 'right' },  // CGST
          6: { cellWidth: 16, halign: 'right' },  // SGST
          7: { cellWidth: 16, halign: 'right' },  // IGST
          8: { cellWidth: 22, halign: 'right' }   // Total Revenue
        },
        margin: { left: margin, right: margin },
        tableWidth: 200, // Fixed width for portrait
        didDrawPage: function (data) {
          // Add page numbers with Times New Roman
          doc.setFontSize(8);
          doc.setFont('times', 'normal');
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      });

      // Calculate totals with proper tax details access
      const totals = invoicesData.reduce((acc, invoice) => {
        const itemsTotal = (invoice.invoice_items || []).reduce((sum, item) => {
          return sum + ((item.quantity || 0) * (item.rate || 0));
        }, 0);

        // Get tax details - handle both object and array formats
        let taxDetails = {};
        if (Array.isArray(invoice.tax_details)) {
          taxDetails = invoice.tax_details[0] || {};
        } else {
          taxDetails = invoice.tax_details || {};
        }
        
        const cgstAmount = taxDetails.show_cgst ? (itemsTotal * (taxDetails.cgst || 0) / 100) : 0;
        const sgstAmount = taxDetails.show_sgst ? (itemsTotal * (taxDetails.sgst || 0) / 100) : 0;
        const igstAmount = taxDetails.show_igst ? (itemsTotal * (taxDetails.igst || 0) / 100) : 0;
        const totalRevenue = itemsTotal + cgstAmount + sgstAmount + igstAmount;

        return {
          totalAmount: acc.totalAmount + itemsTotal,
          totalCgst: acc.totalCgst + cgstAmount,
          totalSgst: acc.totalSgst + sgstAmount,
          totalIgst: acc.totalIgst + igstAmount,
          totalRevenue: acc.totalRevenue + totalRevenue
        };
      }, { totalAmount: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, totalRevenue: 0 });

      // Professional summary box like InvoiceGenerator with Times New Roman
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Summary box with border
      doc.setDrawColor(2, 176, 252);
      doc.setLineWidth(0.5);
      doc.rect(margin, finalY, pageWidth - 2 * margin, 50); // Increased height for Total Revenue
      
      // Summary header
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('REPORT SUMMARY', margin + 5, finalY + 8);
      
      // Summary content in two columns with Times New Roman
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      
      // Left column
      doc.text(`Total Invoices: ${invoicesData.length}`, margin + 5, finalY + 18);
      doc.text(`Subtotal Amount: ₹${totals.totalAmount.toFixed(2)}`, margin + 5, finalY + 26);
      doc.text(`Total Tax Amount: ₹${(totals.totalCgst + totals.totalSgst + totals.totalIgst).toFixed(2)}`, margin + 5, finalY + 34);
      doc.text(`Total Revenue: ₹${totals.totalRevenue.toFixed(2)}`, margin + 5, finalY + 42);
      
      // Right column
      const rightCol = pageWidth / 2 + 20;
      doc.text(`Total CGST: ₹${totals.totalCgst.toFixed(2)}`, rightCol, finalY + 18);
      doc.text(`Total SGST: ₹${totals.totalSgst.toFixed(2)}`, rightCol, finalY + 26);
      doc.text(`Total IGST: ₹${totals.totalIgst.toFixed(2)}`, rightCol, finalY + 34);
      
      // Vertical line separator
      doc.line(pageWidth / 2 + 10, finalY, pageWidth / 2 + 10, finalY + 50);

      // Footer with Times New Roman
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.text('This is a computer generated report.', pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Save the PDF with professional naming
      const dateStr = new Date().toISOString().split('T')[0];
      let fileName = `Tax_Revenue_Report_${dateStr}`;
      if (filters.startDate && filters.endDate) {
        fileName += `_${filters.startDate}_to_${filters.endDate}`;
      }
      fileName += '.pdf';
      
      doc.save(fileName);
      
      showSuccess('Tax PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export Tax PDF');
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
          onExportTaxPDF={handleExportTaxPDF}
          isDarkTheme={isDarkTheme}
        />

        {/* Invoice Table */}
        <InvoiceTable
          invoices={invoices}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onInvoiceClick={handleInvoiceClick}
          onInvoiceDelete={handleInvoiceDelete}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setInvoiceToDelete(null);
          }}
          onConfirm={confirmDelete}
          invoiceNumber={invoiceToDelete?.invoice_no}
          customerName={invoiceToDelete?.receivers?.name}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </div>
  );
};

export default Dashboard;
