import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateOrderStatus } from '../../../services/restaurantDashboardService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, ChevronDown } from 'lucide-react';

const StatusDropdown = ({ currentStatus, orderId, onUpdate, allowedStatuses = ['pending', 'completed', 'cancelled'] }) => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.right - 128, // Align right edge, 128px is w-32
      });
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.success) {
        showSuccess(`Status updated to ${newStatus}`);
        if (onUpdate) onUpdate();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (error) {
      showError('An error occurred while updating status');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200 ${
          statusColors[currentStatus?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
        } hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className="capitalize">{currentStatus || 'Pending'}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div 
            className="absolute z-[10000] w-32 rounded-lg bg-white shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn"
            style={{ 
              top: dropdownPosition.top, 
              left: dropdownPosition.left 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {allowedStatuses.map((status) => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status);
                  }}
                  className={`group flex w-full items-center px-4 py-2 text-sm capitalize hover:bg-purple-50 hover:text-purple-700 ${
                    currentStatus === status ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <span className={`mr-2 h-2 w-2 rounded-full ${
                    status === 'pending' ? 'bg-yellow-400' :
                    status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default StatusDropdown;
