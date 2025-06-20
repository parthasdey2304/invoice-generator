import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import { useNotification } from './NotificationProvider.jsx';

const ItemManagementModal = ({ isOpen, onClose, onItemsUpdated, isDarkTheme }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', hsn_code: '853810' });
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error: showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = async () => {
    setIsLoading(true);
    const result = await invoiceService.getItemSuggestions(searchTerm);
    if (result.success) {
      setItems(result.data);
    }
    setIsLoading(false);
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      showError('Please enter an item description');
      return;
    }

    try {
      await invoiceService.updateItemSuggestion(newItem.description, newItem.hsn_code);
      setNewItem({ description: '', hsn_code: '853810' });
      await loadItems();
      onItemsUpdated();
      success('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      showError('Failed to add item');
    }
  };

  const handleEditItem = async (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem.description.trim()) {
      showError('Please enter an item description');
      return;
    }

    try {
      // For simplicity, we'll add the edited version as a new item
      // In a real app, you might want to update the existing item
      await invoiceService.updateItemSuggestion(editingItem.description, editingItem.hsn_code);
      setEditingItem(null);
      await loadItems();
      onItemsUpdated();
      success('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      showError('Failed to update item');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.description}"?`)) {
      return;
    }

    try {
      const result = await invoiceService.deleteItemSuggestion(item.id);
      if (result.success) {
        await loadItems();
        onItemsUpdated();
        success('Item deleted successfully!');
      } else {
        showError('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showError('Failed to delete item');
    }
  };

  const handleSearch = async () => {
    await loadItems();
  };

  if (!isOpen) return null;

  return (    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-poppins">
      <div className={`max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-6 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              📦 Manage Items
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl font-bold p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add New Item */}
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              Add New Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Enter item description"
                  className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring ${
                    isDarkTheme 
                      ? 'bg-gray-600 text-white border-gray-500 focus:ring-blue-500' 
                      : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  HSN Code
                </label>
                <input
                  type="text"
                  value={newItem.hsn_code}
                  onChange={(e) => setNewItem({ ...newItem, hsn_code: e.target.value })}
                  className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring ${
                    isDarkTheme 
                      ? 'bg-gray-600 text-white border-gray-500 focus:ring-blue-500' 
                      : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                  }`}
                />
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className={`mt-4 px-4 py-2 rounded-md ${
                isDarkTheme
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Add Item
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                  isDarkTheme 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                    : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                }`}
              />
              <button
                onClick={handleSearch}
                className={`px-4 py-2 rounded-md ${
                  isDarkTheme
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Search
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              Existing Items ({items.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4">
                <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                  Loading...
                </span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-4">
                <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                  No items found
                </span>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >                  {editingItem && editingItem.id === item.id ? (
                    <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-4 gap-4 items-start sm:items-center">
                      <div className="md:col-span-2 w-full">
                        <input
                          type="text"
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                            isDarkTheme 
                              ? 'bg-gray-600 text-white border-gray-500 focus:ring-blue-500' 
                              : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                          }`}
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <input
                          type="text"
                          value={editingItem.hsn_code}
                          onChange={(e) => setEditingItem({ ...editingItem, hsn_code: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                            isDarkTheme 
                              ? 'bg-gray-600 text-white border-gray-500 focus:ring-blue-500' 
                              : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-300'
                          }`}
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium flex-1 sm:flex-none"
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 font-medium flex-1 sm:flex-none"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>) : (
                    <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-4 gap-4 items-start sm:items-center">
                      <div className="md:col-span-2 w-full">
                        <span className={`font-medium block ${
                          isDarkTheme ? 'text-white' : 'text-gray-800'
                        }`}>
                          {item.description}
                        </span>
                        <span className={`text-sm block sm:hidden ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          HSN: {item.hsn_code} • Used: {item.usage_count} times
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className={`text-sm ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          HSN: {item.hsn_code}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center justify-between w-full sm:w-auto">
                        <span className={`text-sm hidden sm:block ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Used: {item.usage_count}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-4 border-t ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-md ${
                isDarkTheme
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemManagementModal;
