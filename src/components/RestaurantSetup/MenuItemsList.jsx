import React, { useState } from "react";
import { Edit, Trash2, Clock } from "lucide-react";
import DeleteMenuItemModal from "./DeleteMenuItemModal";
import EditMenuItemModal from "./EditMenuItemModal";
import BulkDeleteModal from "./BulkDeleteModal";

const MenuItemsList = ({ menuItems, onEdit, onDelete, onBulkDelete, businessType }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

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

  // Selection handlers
  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (category) => {
    const categoryItems = groupedItems[category];
    const categoryItemIds = categoryItems.map(item => item.id);
    const allSelected = categoryItemIds.every(id => selectedItems.has(id));
    
    const newSelected = new Set(selectedItems);
    if (allSelected) {
      // Deselect all in this category
      categoryItemIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all in this category
      categoryItemIds.forEach(id => newSelected.add(id));
    }
    setSelectedItems(newSelected);
  };

  const isCategoryFullySelected = (category) => {
    const categoryItems = groupedItems[category];
    return categoryItems.every(item => selectedItems.has(item.id));
  };

  const isCategoryPartiallySelected = (category) => {
    const categoryItems = groupedItems[category];
    const selectedCount = categoryItems.filter(item => selectedItems.has(item.id)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  };

  const handleBulkDelete = () => {
    setBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const idsToDelete = Array.from(selectedItems);
    await onBulkDelete(idsToDelete);
    setSelectedItems(new Set());
    setBulkDeleteModal(false);
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteModal(false);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Bulk Action Toolbar */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {sortedCategories.map((category) => {
        const items = groupedItems[category];
        const isFullySelected = isCategoryFullySelected(category);
        const isPartiallySelected = isCategoryPartiallySelected(category);

        return (
          <div key={category} className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getCategoryDisplayName(category)} ({items.length})
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullySelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = isPartiallySelected;
                    }
                  }}
                  onChange={() => handleSelectAll(category)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
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
        businessType={businessType}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteModal
        isOpen={bulkDeleteModal}
        onClose={handleBulkDeleteCancel}
        onConfirm={handleBulkDeleteConfirm}
        itemCount={selectedItems.size}
      />
    </div>
  );
};

export default MenuItemsList;
