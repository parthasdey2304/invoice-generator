import { useState } from 'react';

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
    numberOfBags: '', // New state for number of bags
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className='p-2'>
      <h1 className='text-center text-5xl font-bold py-10'>Invoice Generator</h1>
      <form onSubmit={handleSubmit} className="p-6 mx-auto max-w-4xl bg-white border-blue-300 border-2 shadow-lg rounded-lg py-10 md:my-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Invoice No</label>
            <input
              type="text"
              name="invoiceNo"
              value={formData.invoiceNo}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Transport Name</label>
            <input
              type="text"
              name="transportName"
              value={formData.transportName}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">G.C.N./R.R.NO</label>
            <input
              type="text"
              name="gcn"
              value={formData.gcn}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700">Place of Supply</label>
            <input
              type="text"
              name="placeOfSupply"
              value={formData.placeOfSupply}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Receiver Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="receiverAddress"
              value={formData.receiverAddress}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">GST IN</label>
            <input
              type="text"
              name="receiverGST"
              value={formData.receiverGST}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">State</label>
            <input
              type="text"
              name="receiverState"
              value={formData.receiverState}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Code</label>
            <input
              type="text"
              name="receiverCode"
              value={formData.receiverCode}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Items</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div>
              <label className="block text-gray-700">Description</label>
              <input
                type="text"
                name="description"
                value={item.description}
                onChange={(e) => handleInputChange(e, index, 'items')}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleInputChange(e, index, 'items')}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700">Rate</label>
              <input
                type="number"
                name="rate"
                value={item.rate}
                onChange={(e) => handleInputChange(e, index, 'items')}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              >
                Add Item
              </button>
            </div>
          </div>
        ))}

        <div className="mt-4">
          <label className="block text-gray-700">Number of Bags</label>
          <input
            type="number"
            name="numberOfBags"
            value={formData.numberOfBags}
            onChange={(e) => handleInputChange(e)}
            className="w-32 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700">CGST</label>
            <input
              type="number"
              name="cgst"
              // value={formData.taxDetails.cgst}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">SGST</label>
            <input
              type="number"
              name="sgst"
              // value={formData.taxDetails.sgst}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">IGST</label>
            <input
              type="number"
              name="igst"
              // value={formData.taxDetails.igst}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Other Charges</label>
            <input
              type="number"
              name="otherCharges"
              // value={formData.taxDetails.otherCharges}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Rounded Off</label>
            <input
              type="number"
              name="roundedOff"
              // value={formData.taxDetails.roundedOff}
              onChange={(e) => handleInputChange(e)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankDetails.bankName}
              readOnly
              className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.bankDetails.branch}
              readOnly
              className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">Account No</label>
            <input
              type="text"
              name="accountNo"
              value={formData.bankDetails.accountNo}
              readOnly
              className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700">IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.bankDetails.ifscCode}
              readOnly
              className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
          >
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;