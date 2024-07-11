import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import InvoiceForm from './components/InvoiceForm';
import recognizeText from './utils/recognizeText';
import generateInvoice from './utils/generateInvoice';

const App = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  const handleImageUpload = (imagePath) => {
    recognizeText(imagePath).then((text) => {
      // Parse the text to extract the invoice data
      const parsedData = parseText(text);
      setInvoiceData(parsedData);
    });
  };

  const handleFormSubmit = (values) => {
    console.log(values);
    generateInvoice(values);
  };

  const parseText = (text) => {
    // Implement your text parsing logic here
    return {
      gstNumber: '1234567890',
      transporterName: 'John Doe Transport',
      invoiceNumber: 'INV-001',
      invoiceDate: '2024-07-11',
      items: [
        { name: 'Item 1', price: 100, quantity: 2 },
        { name: 'Item 2', price: 200, quantity: 1 },
      ],
    };
  };

  return (
    <div>
      <h1>Handwritten Invoice Processor</h1>
      <ImageUpload onImageUpload={handleImageUpload} />
      {invoiceData && (
        <InvoiceForm initialValues={invoiceData} onSubmit={handleFormSubmit} />
      )}
    </div>
  );
};

export default App;
