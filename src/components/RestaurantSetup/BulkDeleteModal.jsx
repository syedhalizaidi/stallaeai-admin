import React from 'react';
import { AlertTriangle } from 'lucide-react';

const BulkDeleteModal = ({ isOpen, onClose, onConfirm, itemCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Bulk Delete
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{itemCount}</strong> menu item{itemCount !== 1 ? 's' : ''}? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete {itemCount} Item{itemCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;
