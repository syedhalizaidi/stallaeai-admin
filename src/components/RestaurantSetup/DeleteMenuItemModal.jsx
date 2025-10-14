import React from 'react';
import { X } from 'lucide-react';

const DeleteMenuItemModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg relative text-center">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-none border-none"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {itemName}
                </h3>
                
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete {itemName} from the menu?
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
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteMenuItemModal;
