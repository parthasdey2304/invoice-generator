import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InvoiceForm from './components/InvoiceForm';
import Invoice from './components/InvoiceGenerator';
import Dashboard from './pages/Dashboard';
import Navigation from './components/Navigation';

const HomePage = () => {
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

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
