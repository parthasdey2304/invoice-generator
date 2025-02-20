/**
 * React component that renders an invoice form with various input fields for invoice details, receiver details, items, tax details, and bank details.
 * The component uses state to manage the form data and provides functionality to add new items, toggle a dark theme, and submit the form.
 * The component also displays a message about the dark mode toggle feature for a limited time.
 *
 * @param {function} onSubmit - A callback function that is called when the form is submitted, passing the form data as an argument.
 * @returns {JSX.Element} - The rendered invoice form component.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

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
      bankName: 'CANARA BANK',
      branch: 'DHARMATALA',
      accountNo: '127000140902',
      ifscCode: 'CNRB0019592',
    },
    taxDetails: {
      cgst: '0',
      sgst: '0',
      igst: '0',
      otherCharges: '0',
      roundedOff: '0',
    },
    numberOfBags: '',
    pdfLink: 'https://drive.google.com/file/d/1eUYyZqZBuYCdWR5T1sz25yTQgkXq_Pcl/view?usp=sharing'
  });

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showMessage, setShowMessage] = useState(true);

  const suggestions = [
    "2 MODULAR CONCEALED MS BOXES",
    "3 MODULAR CONCEALED MS BOXES",
    "4 MODULAR CONCEALED MS BOXES",
    "6 MODULAR CONCEALED MS BOXES",
    "8 MODULAR CONCEALED MS BOXES",
    "12 MODULAR CONCEALED MS BOXES",
    "16 MODULAR CONCEALED MS BOXES",
    "18 MODULAR CONCEALED MS BOXES",
    "3 X 3 X 2 CONCEALED MS BOXES",
    "4 X 4 X 2 CONCEALED MS BOXES",
    "6 X 4 X 2 CONCEALED MS BOXES",
    "7 X 4 X 2 CONCEALED MS BOXES",
    "8 X 6 X 2 CONCEALED MS BOXES",
    "10 X 12 X 2 CONCEALED MS BOXES",
    "4 X 8 X 2 CONCEALED MS BOXES",
    "4 X 10 X 2 CONCEALED MS BOXES",
    "8 X 6 X 3 CONCEALED MS BOXES",
    "8 X 10 X 3 CONCEALED MS BOXES",
    "8 X 10 X 2 CONCEALED MS BOXES",
    "8 X 12 X 3 CONCEALED MS BOXES",
    "8 X 12 X 2 CONCEALED MS BOXES",
    "4 X 12 X 2 CONCEALED MS BOXES",
    "6 X 4 X 2½ CONCEALED MS BOXES",
    "4 X 4 X 2½ CONCEALED MS BOXES",
    "8 X 6 X 2½ CONCEALED MS BOXES",
    "12 X 14 X 2 CONCEALED MS BOXES",
    "10 X 14 X 2 CONCEALED MS BOXES",
    "10 X 12 X 2 CONCEALED MS BOXES",
    "FAN BOX WITH ROD ",
    "3 LED BOWL",
    "6 LED BOWL",
    "4.5 LED BOWL ",
    "12 LED BOWL ",
    "8 SQUARE CONCEALED MS BOXES ",
    "HEXAGON FAN BOX",
    "HEXAGON FAN BOX WITH ROD",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleInputChange = (e, index, key) => {
    const { name, value } = e.target;
    if (key === 'items') {
      const items = [...formData.items];
      items[index][name] = value;
      setFormData({ ...formData, items });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/invoice', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Invoice created successfully:', response.data);
      onSubmit(formData);
    } catch (error) {
      console.error('Error uploading the invoice details:', error);
    }
    onSubmit(formData);
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
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
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
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
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
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
            <input
              type="text"
              name="receiverAddress"
              value={formData.receiverAddress}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
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
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
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
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
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
                  {suggestions.map((suggestion, i) => (
                    <option key={i} value={suggestion}>
                      {suggestion}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div>
              <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <input
                type="text"
                name="description"
                value={item.description}
                onChange={(e) => handleInputChange(e, index, 'items')}
                list={`suggestions-${index}`}
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                  isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                }`}
              />
              <datalist id={`suggestions-${index}`}>
                {suggestions.map((suggestion, i) => (
                  <option key={i} value={suggestion} />
                ))}
              </datalist>
            </div> */}
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
                className={`px-4 py-2 mt-2 rounded-md focus:outline-none focus:ring ${
                  isDarkTheme
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
                }`}
              >
                Add Item
              </button>
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
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>CGST</label>
            <input
              type="number"
              name="cgst"
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>SGST</label>
            <input
              type="number"
              name="sgst"
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>IGST</label>
            <input
              type="number"
              name="igst"
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Other Charges</label>
            <input
              type="number"
              name="otherCharges"
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring ${
                isDarkTheme ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Rounded Off</label>
            <input
              type="number"
              name="roundedOff"
              onChange={(e) => handleInputChange(e)}
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
              readOnly
              className={`w-full px-4 py-2 mt-2 border rounded-md ${
                isDarkTheme ? 'bg-gray-600 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.bankDetails.branch}
              readOnly
              className={`w-full px-4 py-2 mt-2 border rounded-md ${
                isDarkTheme ? 'bg-gray-600 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Account No</label>
            <input
              type="text"
              name="accountNo"
              value={formData.bankDetails.accountNo}
              readOnly
              className={`w-full px-4 py-2 mt-2 border rounded-md ${
                isDarkTheme ? 'bg-gray-600 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.bankDetails.ifscCode}
              readOnly
              className={`w-full px-4 py-2 mt-2 border rounded-md ${
                isDarkTheme ? 'bg-gray-600 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className={`w-full px-6 py-2 rounded-md focus:outline-none focus:ring ${
              isDarkTheme
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300'
            }`}
          >
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
