import { useState } from 'react';

const FilterBar = ({ filters, onFilterChange, onExportCSV, isDarkTheme }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      customer: '',
      minAmount: '',
      maxAmount: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          🔍 Filters
        </h3>
        <button
          onClick={onExportCSV}
          className={`px-4 py-2 rounded-md font-medium ${
            isDarkTheme
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          📊 Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={localFilters.startDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme 
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={localFilters.endDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme 
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Customer
          </label>
          <input
            type="text"
            name="customer"
            value={localFilters.customer}
            onChange={handleInputChange}
            placeholder="Search customer..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme 
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Min Amount
          </label>
          <input
            type="number"
            name="minAmount"
            value={localFilters.minAmount}
            onChange={handleInputChange}
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme 
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Max Amount
          </label>
          <input
            type="number"
            name="maxAmount"
            value={localFilters.maxAmount}
            onChange={handleInputChange}
            placeholder="100000"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
              isDarkTheme 
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApplyFilters}
          className={`px-4 py-2 rounded-md font-medium ${
            isDarkTheme
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className={`px-4 py-2 rounded-md font-medium ${
            isDarkTheme
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
