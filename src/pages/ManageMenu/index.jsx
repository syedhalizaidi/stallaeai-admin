import React, { useState, useEffect } from "react";
import styles from "./ManageMenu.module.scss";
import MenuForm from "../../components/MenuComponents/MenuForm";
import { restaurantService } from "../../services/restaurantService";
import { ChevronDown, Loader2 } from "lucide-react";

export default function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const fetchBusinesses = async () => {
    setLoadingBusinesses(true);

    const result = await restaurantService.getRestaurants();
    if (result.success) {
      const list = result.data || [];
      setRestaurants(list);

      // Auto-select first business if available
      if (list.length > 0) {
        setSelectedBusiness(list[0]);
      }
    } else {
      console.error(result.error);
    }

    setLoadingBusinesses(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    setDropdownOpen(false);
  };

  return (
    <div
      className={`flex-1 p-8 max-h-[90vh] overflow-y-auto ${styles.manageMenuWrapper}`}
    >
        {/* Business Dropdown */}
        <div className="mb-6 relative w-full">
          {/* Dropdown button */}
          <button
            onClick={() =>
              !loadingBusinesses && setDropdownOpen((prev) => !prev)
            }
            disabled={loadingBusinesses}
            className={`flex justify-between items-center w-full bg-white border 
              border-gray-300 rounded-lg px-4 py-2 shadow-sm transition-all duration-200
              ${
                loadingBusinesses
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-md"
              }
            `}
          >
            <span className="font-medium text-gray-800 flex items-center gap-2">
              {loadingBusinesses ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  Loading businesses...
                </>
              ) : selectedBusiness ? (
                selectedBusiness.name ||
                selectedBusiness.business_name ||
                "Unnamed Business"
              ) : (
                `Select Business (${restaurants.length})`
              )}
            </span>

            {!loadingBusinesses && (
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Dropdown list */}
          {dropdownOpen && !loadingBusinesses && (
            <div
              className="absolute z-10 mt-2 w-full bg-white border border-gray-200 
              rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fadeIn"
            >
              {restaurants.map((biz, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectBusiness(biz)}
                  className="px-4 py-2 text-gray-700 hover:bg-purple-50 
                  hover:text-purple-700 cursor-pointer transition-colors"
                >
                  {biz.name || biz.business_name || `Business ${idx + 1}`}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu form rendered only when a business is selected */}
        {selectedBusiness ? (
          <MenuForm
            business={selectedBusiness}
            menuItems={menu}
            restaurantId={selectedBusiness.id}
            onMenuItemsChange={setMenu}
            bussinessType={selectedBusiness.business_type}
          />
        ) : (
          <div className="text-gray-600 text-sm">
            Please select a business to manage its menu.
          </div>
        )}
    </div>
  );
}
