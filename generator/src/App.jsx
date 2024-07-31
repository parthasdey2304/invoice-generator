import React, { useState } from 'react';
import InvoiceForm from './components/InvoiceForm';
import Invoice from './components/InvoiceGenerator';

const App = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  const handleFormSubmit = (data) => {
    setInvoiceData(data);
  };

  return (
    <div>
      <InvoiceForm onSubmit={handleFormSubmit} />
      {invoiceData && <Invoice data={invoiceData} />}
    </div>
  );
};

export default App;
