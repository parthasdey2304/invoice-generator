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

const InvoiceForm = ({ onSubmit }) => {
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
      cgst: '0',
      sgst: '0',
      igst: '0',
      otherCharges: '0',
      lessDiscount: '0',
      roundedOff: '0',
      showCgst: false,
      showSgst: false,
      showIgst: false,
      showOtherCharges: false,
      showLessDiscount: false,
      showRoundedOff: false,
    },
    numberOfBags: '',
    pdfLink: 'https://drive.google.com/file/d/1eUYyZqZBuYCdWR5T1sz25yTQgkXq_Pcl/view?usp=sharing'
  });

  const [isDarkTheme, setIsDarkTheme] = useState(true);
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

  // Load initial data from database
  useEffect(() => {
    loadItemSuggestions();
    loadFieldSuggestions();
    
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const loadItemSuggestions = async () => {
    const result = await invoiceService.getItemSuggestions();
    if (result.success) {
      setItemSuggestions(result.data);
    }
  };

  const loadFieldSuggestions = async () => {
    const fields = ['transportName', 'placeOfSupply', 'receiverName', 'receiverAddress', 'receiverState'];
    const suggestions = {};
    
    for (const field of fields) {
      const result = await invoiceService.getFormFieldHistory(field);
      if (result.success) {
        suggestions[field] = result.data;
      }
    }
    
    setFieldSuggestions(suggestions);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle('dark');
  };

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
      const result = await invoiceService.createInvoice(formData);
      
      if (result.success) {
        console.log('Invoice created successfully:', result.invoice);
        onSubmit(formData);
        
        // Reload suggestions to include any new data
        loadItemSuggestions();
        loadFieldSuggestions();
      } else {
        console.error('Error creating invoice:', result.error);
        alert('Error creating invoice: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert('Error submitting invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-2 transition-colors duration-300 ${isDarkTheme ? 'dark:bg-gray-900' : 'bg-white'}`}>
      <div className="fixed top-4 right-4 flex items-center">
        {showMessage && (
          <span className="mr-4 text-md font-['Poppins'] font-semibold text-gray-700 dark:text-gray-300 animate-bounce p-1 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
              Try our new dark mode toggle!
            </span>
          </span>
        )}
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" checked={isDarkTheme} onChange={toggleTheme} />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="-mt-1 ml-3 text-md font-medium text-gray-900 dark:text-gray-300">
            {isDarkTheme ? '🌙' : '☀️'}
          </span>
        </label>
      </div>

      <h1 className={`text-center text-5xl font-bold pt-16 py-10 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
        Invoice Generator
      </h1>

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
        <h2 className={`text-3xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Invoice Details</h2>
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
              {fieldSuggestions.transportName.map((suggestion, i) => (
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
              {fieldSuggestions.placeOfSupply.map((suggestion, i) => (
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
              {fieldSuggestions.receiverName.map((suggestion, i) => (
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
              {fieldSuggestions.receiverAddress.map((suggestion, i) => (
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
              {fieldSuggestions.receiverState.map((suggestion, i) => (
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
        {formData.items.map((item, index) => (
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
                  {itemSuggestions.map((suggestion, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showLessDiscount"
                checked={formData.taxDetails.showLessDiscount}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Less Discount</label>
            </div>
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
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="showRoundedOff"
                checked={formData.taxDetails.showRoundedOff}
                onChange={(e) => handleInputChange(e, null, 'taxDetails')}
                className="mr-2"
              />
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Rounded Off</label>
            </div>
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
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-2 rounded-md focus:outline-none focus:ring ${
              isDarkTheme
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Invoice...' : 'Generate Invoice'}
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
