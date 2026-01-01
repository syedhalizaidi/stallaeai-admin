import React, { useState, useEffect } from "react";
import styles from "./ManageMenu.module.scss";
import MenuForm from "../../components/MenuComponents/MenuForm";
import { useBusinessContext } from "../../contexts/BusinessContext";

export default function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const { selectedBusiness } = useBusinessContext();



  return (
    <div
      className={`flex-1 p-8 max-h-[90vh] overflow-y-auto ${styles.manageMenuWrapper}`}
    >

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
