import { useState, useEffect } from 'react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  invoiceNumber, 
  customerName,
  isDarkTheme 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset deleting state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // The parent component will handle closing the modal
    } catch (error) {
      console.error('Error during deletion:', error);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-md w-full ${
        isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">Delete Invoice</h3>
            <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className={`mb-6 p-4 rounded-lg ${
          isDarkTheme ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="text-sm">
            <div className="mb-2">
              <span className={`font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                Invoice Number:
              </span>
              <span className="ml-2 font-mono">{invoiceNumber}</span>
            </div>
            <div>
              <span className={`font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                Customer:
              </span>
              <span className="ml-2">{customerName || 'N/A'}</span>
            </div>
          </div>
        </div>

        <p className={`text-sm mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          Are you sure you want to delete this invoice? This will permanently remove:
        </p>

        <ul className={`text-sm mb-6 ml-4 space-y-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          <li>• Invoice record and all associated data</li>
          <li>• Customer information for this invoice</li>
          <li>• All invoice items and tax details</li>
        </ul>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              isDarkTheme
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              'Delete Invoice'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
