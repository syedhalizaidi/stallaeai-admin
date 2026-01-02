import { X } from 'lucide-react';

export default function PageModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Content - Hide scrollbar */}
          <div 
            className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
              }
            `}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
