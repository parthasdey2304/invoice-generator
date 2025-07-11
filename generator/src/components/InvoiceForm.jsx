/**
 * Enhanced React component that renders an invoice form with Supabase integration.
 * Features: checkboxes for tax field visibility, database-backed suggestions, item management modal.
 *
 * @param {function} onSubmit - A callback function that is called when the form is submitted, passing the form data as an argument.
 * @returns {JSX.Element} - The rendered invoice form component.
 */
import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import ItemManagementModal from './ItemManagementModal.jsx';
import { useNotification } from './NotificationProvider.jsx';

const InvoiceForm = ({ onSubmit }) => {
  const { success, error: showError } = useNotification();
  
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: '',
    transportName: '',
    gcn: '',
    placeOfSupply: '',
    receiverName: '',
    receiverAddress: '',
    receiverGST: '',
    receiverState: '',
    receiverCode: '',
    items: [{ description: '', hsnCode: '853810', quantity: '', rate: '' }],
    bankDetails: {
      bankName: 'STATE BANK OF INDIA',
      branch: 'TANGRA',
      accountNo: '43776936082',
      ifscCode: 'SBIN0003737',
    },
    taxDetails: {
      cgst: '9',
      sgst: '9',
      igst: '0',
      otherCharges: '0',
      lessDiscount: '0',
      roundedOff: '0',
      showCgst: true,
      showSgst: true,
      showIgst: true,
      showOtherCharges: true,
      showLessDiscount: false,
      showRoundedOff: true, // Default to Rounded Off
    },
    numberOfBags: '',
    pdfLink: 'https://drive.google.com/file/d/1eUYyZqZBuYCdWR5T1sz25yTQgkXq_Pcl/view?usp=sharing'
  });

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMessage, setShowMessage] = useState(true);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [fieldSuggestions, setFieldSuggestions] = useState({
    transportName: [],
    placeOfSupply: [],
    receiverName: [],
    receiverAddress: [],
    receiverState: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnectionError, setDbConnectionError] = useState(false);

  // Fallback suggestions when database is not available
  const fallbackItemSuggestions = [
    { description: "2 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "3 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "4 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "6 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "8 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "12 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "16 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "18 MODULAR CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "3 X 3 X 2 CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "4 X 4 X 2 CONCEALED MS BOXES", hsn_code: "853810" },
    { description: "FAN BOX WITH ROD", hsn_code: "853810" },
    { description: "3 LED BOWL", hsn_code: "853810" },
    { description: "6 LED BOWL", hsn_code: "853810" },
    { description: "HEXAGON FAN BOX", hsn_code: "853810" }
  ];

  // Load initial data from database with fallback
  useEffect(() => {
    loadItemSuggestions();
    loadFieldSuggestions();
    
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const loadItemSuggestions = async () => {
    try {
      const result = await invoiceService.getItemSuggestions();
      if (result.success) {
        setItemSuggestions(result.data);
        setDbConnectionError(false);
      } else {
        console.warn('Failed to load item suggestions, using fallback:', result.error);
        setItemSuggestions(fallbackItemSuggestions);
        setDbConnectionError(true);
      }
    } catch (error) {
      console.error('Error loading item suggestions, using fallback:', error);
      setItemSuggestions(fallbackItemSuggestions);
      setDbConnectionError(true);
    }
  };

  const loadFieldSuggestions = async () => {
    const fields = ['transportName', 'placeOfSupply', 'receiverName', 'receiverAddress', 'receiverState'];
    const suggestions = {
      transportName: [],
      placeOfSupply: [],
      receiverName: [],
      receiverAddress: [],
      receiverState: []
    };
    
    let hasError = false;
    
    for (const field of fields) {
      try {
        const result = await invoiceService.getFormFieldHistory(field);
        if (result.success) {
          suggestions[field] = result.data || [];
        } else {
          console.warn(`Failed to load suggestions for ${field}, using empty array:`, result.error);
          suggestions[field] = [];
          hasError = true;
        }
      } catch (error) {
        console.error(`Error loading suggestions for ${field}, using empty array:`, error);
        suggestions[field] = [];
        hasError = true;
      }
    }
    
    setFieldSuggestions(suggestions);
    if (hasError) {
      setDbConnectionError(true);
    }
  };

  // Sync dark theme state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      setIsDarkTheme(saved !== null ? JSON.parse(saved) : true);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load edit data if available
  useEffect(() => {
    const editData = localStorage.getItem('editInvoiceData');
    if (editData) {
      try {
        const parsedData = JSON.parse(editData);
        setFormData(parsedData);
        // Clear the edit data from localStorage after loading
        localStorage.removeItem('editInvoiceData');
        success('Invoice loaded for editing!');
      } catch (error) {
        console.error('Error loading edit data:', error);
        showError('Error loading invoice data for editing');
      }
    }
  }, [success, showError]);

  const handleInputChange = (e, index, key) => {
    const { name, value, type, checked } = e.target;
    
    if (key === 'items') {
      const items = [...formData.items];
      items[index][name] = value;
      setFormData({ ...formData, items });
    } else if (key === 'taxDetails') {
      const taxDetails = { ...formData.taxDetails };
      if (type === 'checkbox') {
        taxDetails[name] = checked;
      } else {
        taxDetails[name] = value;
      }
      setFormData({ ...formData, taxDetails });
    } else if (key === 'bankDetails') {
      const bankDetails = { ...formData.bankDetails };
      bankDetails[name] = value;
      setFormData({ ...formData, bankDetails });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', hsnCode: '853810', quantity: '', rate: '' }],
    });
  };

  const handleRemoveItem = (indexToRemove) => {
    const items = formData.items.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if this is an edit operation
      const isEdit = formData.isEdit && formData.originalId;
      let result;
      
      if (isEdit) {
        // Update existing invoice
        result = await invoiceService.updateInvoice(formData.originalId, formData);
        
        if (result.success) {
          console.log('Invoice updated successfully:', result.invoice);
          success('🎉 Invoice updated successfully!');
        } else {
          console.error('Error updating invoice:', result.error);
          showError('Failed to update invoice: ' + result.error);
          return;
        }
      } else {
        // Create new invoice
        result = await invoiceService.createInvoice(formData);
        
        if (result.success) {
          console.log('Invoice created successfully:', result.invoice);
          success('🎉 Invoice created successfully!');
        } else {
          console.error('Error creating invoice:', result.error);
          showError('Failed to create invoice: ' + result.error);
          return;
        }
      }
      
      // Flatten the tax details for the invoice generator
      const flattenedData = {
        ...formData,
        // Flatten tax details to match what InvoiceGenerator expects
        cgst: formData.taxDetails.cgst,
        sgst: formData.taxDetails.sgst,
        igst: formData.taxDetails.igst,
        otherCharges: formData.taxDetails.otherCharges,
        lessDiscount: formData.taxDetails.lessDiscount,
        roundedOff: formData.taxDetails.roundedOff,
        showCgst: formData.taxDetails.showCgst,
        showSgst: formData.taxDetails.showSgst,
        showIgst: formData.taxDetails.showIgst,
        showOtherCharges: formData.taxDetails.showOtherCharges,
        showLessDiscount: formData.taxDetails.showLessDiscount,
        showRoundedOff: formData.taxDetails.showRoundedOff,
      };
      
      onSubmit(flattenedData);
      
      // Reload suggestions to include any new data
      loadItemSuggestions();
      loadFieldSuggestions();
      
      // Clear edit state if it was an edit operation
      if (isEdit) {
        setFormData(prev => ({
          ...prev,
          isEdit: false,
          originalId: null
        }));
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      showError('Error submitting invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-2 transition-colors duration-300 font-poppins ${isDarkTheme ? 'dark:bg-gray-900' : 'bg-white'}`}>
      
      <h1 className={`text-center text-5xl font-bold pt-16 py-10 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
        Invoice Generator
      </h1>

      {dbConnectionError && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Database Setup Required
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>
                    Cannot connect to database tables. The app is using fallback data. 
                    <br />
                    Please run the SQL commands in <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">database_schema.sql</code> in your Supabase project.
                    <br />
                    <a 
                      href="./SUPABASE_SETUP.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium underline hover:no-underline"
                    >
                      View setup instructions →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => setIsItemModalOpen(true)}
          className={`px-6 py-3 rounded-lg font-semibold ${
            isDarkTheme
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          📦 Manage Items
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`p-6 mx-auto max-w-4xl ${
        isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-300'
      } border-2 shadow-lg rounded-lg py-10 md:my-10`}>
        <div className="mb-6">
          <h2 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
            {formData.isEdit ? 'Edit Invoice' : 'Invoice Details'}
          </h2>
          {formData.isEdit && (
            <div className={`mt-2 p-3 rounded-lg ${
              isDarkTheme ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
            }`}>
              <p className="text-sm">
                ✏️ <strong>Edit Mode:</strong> You are editing invoice #{formData.invoiceNo}
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Invoice No</label>
            <input
              type="text"
              name="invoiceNo"
              value={formData.invoiceNo}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Transport Name</label>
            <input
              type="text"
              name="transportName"
              value={formData.transportName}
              onChange={(e) => handleInputChange(e)}
              list="transportName-suggestions"
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
            <datalist id="transportName-suggestions">
              {(fieldSuggestions?.transportName || []).map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>G.C.N./R.R.NO</label>
            <input
              type="text"
              name="gcn"
              value={formData.gcn}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Place of Supply</label>
            <input
              type="text"
              name="placeOfSupply"
              value={formData.placeOfSupply}
              onChange={(e) => handleInputChange(e)}
              list="placeOfSupply-suggestions"
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
            <datalist id="placeOfSupply-suggestions">
              {(fieldSuggestions?.placeOfSupply || []).map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
        </div>

        <h3 className={`text-2xl font-bold mt-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Receiver Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={(e) => handleInputChange(e)}
              list="receiverName-suggestions"
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
            <datalist id="receiverName-suggestions">
              {(fieldSuggestions?.receiverName || []).map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
            <input
              type="text"
              name="receiverAddress"
              value={formData.receiverAddress}
              onChange={(e) => handleInputChange(e)}
              list="receiverAddress-suggestions"
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
            <datalist id="receiverAddress-suggestions">
              {(fieldSuggestions?.receiverAddress || []).map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>GST IN</label>
            <input
              type="text"
              name="receiverGST"
              value={formData.receiverGST}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
            <input
              type="text"
              name="receiverState"
              value={formData.receiverState}
              onChange={(e) => handleInputChange(e)}
              list="receiverState-suggestions"
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
            <datalist id="receiverState-suggestions">
              {(fieldSuggestions?.receiverState || []).map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Code</label>
            <input
              type="text"
              name="receiverCode"
              value={formData.receiverCode}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
        </div>

        <h3 className={`text-2xl font-bold mt-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Items</h3>
        {(formData.items || []).map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
              <div>
                <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <select
                  name="description"
                  value={item.description}
                  onChange={(e) => handleInputChange(e, index, 'items')}
                  className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                    isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                  }`}
                >
                  <option value="">Select an item</option>
                  {(itemSuggestions || []).map((suggestion, i) => (
                    <option key={i} value={suggestion.description}>
                      {suggestion.description}
                    </option>
                  ))}
                </select>
              </div>
            <div>
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleInputChange(e, index, 'items')}
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                  isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                }`}
              />
            </div>
            <div>
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Rate</label>
              <input
                type="number"
                name="rate"
                value={item.rate}
                onChange={(e) => handleInputChange(e, index, 'items')}
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                  isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                }`}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                className={`px-4 py-2 mt-2 rounded-md focus:outline-none focus:ring mr-2 ${
                  isDarkTheme
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
                }`}
              >
                Add
              </button>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className={`px-4 py-2 mt-2 rounded-md focus:outline-none focus:ring ${
                    isDarkTheme
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300'
                  }`}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="mt-4">
          <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Number of Bags</label>
          <input
            type="number"
            name="numberOfBags"
            value={formData.numberOfBags}
            onChange={(e) => handleInputChange(e)}
            className={`w-32 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <h3 className={`text-2xl font-bold mt-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showCgst"
                checked={formData.taxDetails.showCgst}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>CGST</label>
            </div>
            <input
              type="number"
              name="cgst"
              value={formData.taxDetails.cgst}
              onChange={(e) => handleInputChange(e, null, 'taxDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showSgst"
                checked={formData.taxDetails.showSgst}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>SGST</label>
            </div>
            <input
              type="number"
              name="sgst"
              value={formData.taxDetails.sgst}
              onChange={(e) => handleInputChange(e, null, 'taxDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showIgst"
                checked={formData.taxDetails.showIgst}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>IGST</label>
            </div>
            <input
              type="number"
              name="igst"
              value={formData.taxDetails.igst}
              onChange={(e) => handleInputChange(e, null, 'taxDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showOtherCharges"
                checked={formData.taxDetails.showOtherCharges}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Other Charges</label>
            </div>
            <input
              type="number"
              name="otherCharges"
              value={formData.taxDetails.otherCharges}
              onChange={(e) => handleInputChange(e, null, 'taxDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className={`text-lg font-semibold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Adjustment Settings</h4>
          <div>
            <div className="flex items-center mb-2">
              <span className={`block mr-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                Adjustment Type:
              </span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adjustmentType"
                    value="lessDiscount"
                    checked={formData.taxDetails.showLessDiscount}
                    onChange={(e) => {
                      const newTaxDetails = {
                        ...formData.taxDetails,
                        showLessDiscount: true,
                        showRoundedOff: false
                      };
                      setFormData({ ...formData, taxDetails: newTaxDetails });
                    }}
                    className="mr-2"
                  />
                  <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Less Discount</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adjustmentType"
                    value="roundedOff"
                    checked={formData.taxDetails.showRoundedOff}
                    onChange={(e) => {
                      const newTaxDetails = {
                        ...formData.taxDetails,
                        showLessDiscount: false,
                        showRoundedOff: true
                      };
                      setFormData({ ...formData, taxDetails: newTaxDetails });
                    }}
                    className="mr-2"
                  />
                  <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Rounded Off</span>
                </label>
              </div>
            </div>
            {formData.taxDetails.showLessDiscount && (
              <div>
                <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Less Discount Amount</label>
                <input
                  type="number"
                  name="lessDiscount"
                  value={formData.taxDetails.lessDiscount}
                  onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                  className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                    isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                  }`}
                />
              </div>
            )}
            {formData.taxDetails.showRoundedOff && (
              <div>
                <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Rounded Off Amount</label>
                <input
                  type="number"
                  name="roundedOff"
                  value={formData.taxDetails.roundedOff}
                  onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                  className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                    isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        <h3 className={`text-2xl font-bold mt-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>PDF QR Link</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Link</label>
            <input
              type="text"
              name="pdfLink"
              value={formData.pdfLink}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
        </div>

        <h3 className={`text-2xl font-bold mt-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankDetails.bankName}
              onChange={(e) => handleInputChange(e, null, 'bankDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.bankDetails.branch}
              onChange={(e) => handleInputChange(e, null, 'bankDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Account No</label>
            <input
              type="text"
              name="accountNo"
              value={formData.bankDetails.accountNo}
              onChange={(e) => handleInputChange(e, null, 'bankDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.bankDetails.ifscCode}
              onChange={(e) => handleInputChange(e, null, 'bankDetails')}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
        </div>        <div className="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-2 rounded-md focus:outline-none focus:ring ${
              isDarkTheme
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading 
              ? (formData.isEdit ? 'Updating Invoice...' : 'Creating Invoice...') 
              : (formData.isEdit ? 'Update Invoice' : 'Generate Invoice')
            }
          </button>
        </div>
      </form>

      {/* Item Management Modal */}
      <ItemManagementModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onItemsUpdated={loadItemSuggestions}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default InvoiceForm;
