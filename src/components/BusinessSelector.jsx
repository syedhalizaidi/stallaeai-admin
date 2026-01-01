import { Store, ChevronDown } from 'lucide-react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useState } from 'react';

export default function BusinessSelector() {
  const { selectedBusiness, businesses, selectBusiness } = useBusinessContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative min-w-[240px]">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
        SELECT BUSINESS
      </div>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex justify-between items-center w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
      >
        <div className="flex items-center overflow-hidden">
          <div className="bg-[linear-gradient(135deg,_#557ebf_0%,_#667eea_100%)] p-1.5 rounded-lg mr-3">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-[10px] text-gray-500 font-bold tracking-wide">
              BUSINESS
            </span>
            <span className="font-bold text-gray-900 truncate text-sm">
              {selectedBusiness
                ? selectedBusiness.name ||
                  selectedBusiness.business_name ||
                  "Unnamed Business"
                : "Select Business"}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180 text-purple-500" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn ring-1 ring-black ring-opacity-5">
          {businesses.length > 0 ? (
            businesses.map((biz, idx) => (
              <div
                key={idx}
                onClick={() => {
                  selectBusiness(biz);
                  setDropdownOpen(false);
                }}
                className="px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center"
              >
                <div className="h-2 w-2 rounded-full bg-purple-400 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {biz.name || biz.business_name || `Business ${idx + 1}`}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm text-center">
              No businesses found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
