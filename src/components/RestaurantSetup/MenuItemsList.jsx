import React, { useState } from "react";
import { Edit, Trash2, Clock } from "lucide-react";
import DeleteMenuItemModal from "./DeleteMenuItemModal";
import EditMenuItemModal from "./EditMenuItemModal";

const MenuItemsList = ({ menuItems, onEdit, onDelete }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories alphabetically, but keep "Uncategorized" at the end
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  // Sort items within each category by name
  sortedCategories.forEach((category) => {
    groupedItems[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      Appetizers: "Appetizers",
      "Main Courses": "Main Courses",
      Desserts: "Desserts",
      Beverages: "Beverages",
      Salads: "Salads",
      Soups: "Soups",
      Sides: "Sides",
      "Side Dishes": "Side Dishes",
      Other: "Other",
    };
    return categoryMap[category] || category;
  };

  const handleDeleteClick = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.item) {
      onDelete(deleteModal.item.id);
      setDeleteModal({ isOpen: false, item: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, item: null });
  };

  const handleEditClick = (item) => {
    setEditModal({ isOpen: true, item });
  };

  const handleEditClose = () => {
    setEditModal({ isOpen: false, item: null });
  };

  const handleEditUpdate = async (itemId, data) => {
    await onEdit(itemId, data);
    setEditModal({ isOpen: false, item: null });
  };

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const items = groupedItems[category];
        return (
          <div key={category} className="bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getCategoryDisplayName(category)} ({items.length})
            </h3>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div className="h-[72px] w-[72px] rounded-full flex items-center justify-center">
                    <img
                      src={
                        item.images && item.images[0] instanceof File
                          ? URL.createObjectURL(item.images[0])
                          : item.images && item.images[0]?.image_url
                          ? item.images[0].image_url
                          : "https://via.placeholder.com/100x100?text=No+Image"
                      }
                      alt="item-main-img"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div className="flex flex-1 items-center justify-between px-6">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>

                    <p className="text-base font-semibold mb-6">
                      ${item.price}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      <DeleteMenuItemModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.item?.name}
      />

      {/* Edit Menu Item Modal */}
      <EditMenuItemModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        onUpdate={handleEditUpdate}
        item={editModal.item}
      />
    </div>
  );
};

export default MenuItemsList;
