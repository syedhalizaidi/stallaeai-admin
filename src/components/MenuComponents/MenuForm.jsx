import React, { useEffect, useState } from "react";
import { Menu, Plus, ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import styles from "./styles/RestaurantSetup.module.scss";
import InputField from "../InputField";
import SelectField from "../SelectField";
import TextAreaField from "../TextAreaField";
import NumberInput from "../NumberInput";
import MenuItemList from "./MenuItemList";
import Button from "../Button";
import UploadImageField from "./UploadImageField";
import MenuModal from "./menuModel/index";
import DeleteModal from "./deleteModal/index";
import {
  createMenuItems,
  getMenuItems,
  deleteMenuItemImage,
} from "../../services/restaurantDashboardService";
import { useToast } from "../../contexts/ToastContext";

const MenuForm = ({ menuItems, restaurantId, onMenuItemsChange, onNext, onPrevious }) => {
  const [restaurant_id, setRestaurantId] = useState(null);
  const [currentItem, setCurrentItem] = React.useState({
    name: "",
    category: "",
    description: "",
    price: "",
    prep_time: "",
    images: [],
  });
  const [editingItemId, setEditingItemId] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [imageId, setImageId] = React.useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [menu, setMenu] = useState(null);
  const { showError, showSuccess } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categoryOptions = [
    { value: "Appetizers", label: "Appetizers" },
    { value: "Soups", label: "Soups" },
    { value: "Salad", label: "Salad" },
    { value: "Main Courses", label: "Main Courses" },
    { value: "Desserts", label: "Desserts" },
    { value: "Beverages", label: "Beverages" },
    { value: "Side Dishes", label: "Side Dishes" },
    { value: "Other", label: "Other" },
  ];

  const handleCurrentItemChange = async (eOrFiles) => {
    if (eOrFiles.length === 0 && imageId) {
      const storedId = restaurantId
      const response = await deleteMenuItemImage(imageId);
      if (response.success) {
        showSuccess("Image deleted successfully");
        handleGetMenuItems(storedId);
      } else {
        console.error("Failed to delete menu item image:", response.message);
      }
    }
    if (Array.isArray(eOrFiles)) {
      setCurrentItem((prev) => ({
        ...prev,
        images: eOrFiles,
      }));
    } else if (eOrFiles && eOrFiles.target) {
      const { name, value, type, files } = eOrFiles.target;
      if (type === "file") {
        const fileArray = Array.from(files);
        setCurrentItem((prev) => ({
          ...prev,
          images: fileArray,
        }));
      } else {
        setCurrentItem((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const itemToSave = {
      ...currentItem,
      id: editingItemId || Date.now(),
    };

    const formData = new FormData();
    formData.append("restaurant_id", restaurant_id);
    formData.append("name", itemToSave.name);
    formData.append(
      "category",
      currentItem.category === "Other" ? customCategory : currentItem.category
    );
    formData.append("description", itemToSave.description);
    formData.append("price", itemToSave.price);
    formData.append("prep_time", itemToSave.prep_time);

    if (itemToSave.images && itemToSave.images.length > 0) {
      itemToSave.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const response = await createMenuItems(formData);

      if (!response.success) {
        throw new Error(response.message || "Failed to save menu item");
      }

      const savedItem = response.data;
      if (!editingItemId && savedItem.id) {
        localStorage.setItem("menu_item_id", savedItem.id);
      }

      if (onMenuItemsChange && menuItems) {
        if (editingItemId) {
          onMenuItemsChange(
            menuItems.map((item) =>
              item.id === editingItemId ? savedItem : item
            )
          );
        } else {
          onMenuItemsChange([...menuItems, savedItem]);
        }
      }
      setShowForm(false);
      setCurrentItem({
        name: "",
        category: "",
        description: "",
        price: "",
        prep_time: "",
        images: [],
      });
      setCustomCategory("");
      setEditingItemId(null);
    } catch (err) {
      console.error(err);
      showError(
        err.message || "Something went wrong while saving the menu item."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = (menuOrId) => {
    const menuObj =
      typeof menuOrId === "object"
        ? menuOrId
        : menuItems?.find((m) => String(m.id) === String(menuOrId));
    setDeleteTarget(menuObj || menuOrId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await handleGetMenuItems();
    setDeleteTarget(null);
  };

  const handleAddNew = () => {
    setImageId(null);
    setCurrentItem({
      name: "",
      category: "",
      description: "",
      price: "",
      prep_time: "",
      images: [],
    });
    setCustomCategory("");
    setEditingItemId(null);
    setShowForm(true);
  };

  const handleGetMenuItems = async () => {
    const storedId = restaurantId
    if (storedId) {
      const response = await getMenuItems(storedId);
      if (response.success) {
        onMenuItemsChange(response.data);
      } else {
        console.error("Failed to fetch menu items:", response.message);
      }
    }
  };

  useEffect(() => {
    const storedId = restaurantId
    if (storedId) {
      setRestaurantId(storedId);
      handleGetMenuItems();
    }
  }, [restaurantId]);

  const handleMenuItem = (menu) => {
    setMenu(menu);
    setIsModalOpen(true);
  };

  if (menuItems && onMenuItemsChange) {
    return (
      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <Menu className={styles.sectionIcon} />
          <h2>Menu</h2>
        </div>

        <MenuItemList
          menuItems={menuItems}
          onUpdateItem={handleMenuItem}
          onDeleteItem={handleDeleteItem}
        />

        <MenuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          restaurantId={restaurant_id}
          menu={menu}
          handleGetMenuItems={handleGetMenuItems}
        />

        {showForm && (
          <div className={styles.menuFormSection}>
            <h2 className={styles.formTitle}>
              {editingItemId ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
            <div className={styles.formGrid}>
              <UploadImageField
                label="Upload Image for Current Item"
                name="image"
                value={currentItem.images || []}
                onChange={handleCurrentItemChange}
                maxImages={1}
                className={styles.uploadImageField}
              />
              <div className={styles.formRow}>
                <InputField
                  label="Item Name"
                  name="name"
                  value={currentItem.name}
                  onChange={handleCurrentItemChange}
                  placeholder="e.g., Margherita Pizza"
                  required
                />
                <SelectField
                  label="Category"
                  name="category"
                  value={currentItem.category}
                  onChange={handleCurrentItemChange}
                  options={categoryOptions}
                  placeholder="Select category"
                  required
                />
                {currentItem.category === "Other" && (
                  <InputField
                    label="Custom Category"
                    name="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter your category"
                    required
                  />
                )}
              </div>
              <TextAreaField
                label="Description"
                name="description"
                value={currentItem.description}
                onChange={handleCurrentItemChange}
                placeholder="Brief description of the item"
              />
              <div className={styles.formRow}>
                <NumberInput
                  label="Price"
                  name="price"
                  value={currentItem.price}
                  onChange={handleCurrentItemChange}
                  placeholder="0.00"
                  type="number"
                  iconType="currency"
                  step="0.01"
                  min="0"
                  required
                />
                <NumberInput
                  label="Prep Time (minutes)"
                  name="prep_time"
                  value={currentItem.prep_time}
                  onChange={handleCurrentItemChange}
                  placeholder="15"
                  type="number"
                  iconType="clock"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <Button
                variant="primary"
                onClick={handleSave}
                icon={!isSaving && <Plus size={16} />}
                iconPosition="start"
                disabled={isSaving}
              >
                {isSaving
                  ? editingItemId
                    ? "Updating..."
                    : "Adding..."
                  : editingItemId
                    ? "Update Menu Item"
                    : "Add to Menu"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingItemId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleAddNew}
          disabled={showForm}
          icon={<Plus size={16} />}
          iconPosition="start"
          className={styles.addButton}
        >
          Add New Menu Item
        </Button>

        <div className={styles.buttonContainer}>
          {onPrevious && (
            <Button
              variant="secondary"
              onClick={onPrevious}
              icon={<ArrowLeft size={16} />}
              iconPosition="start"
            >
              Previous
            </Button>
          )}
          {onNext && (
            <Button
              variant="primary"
              onClick={onNext}
              icon={<ChevronRight size={16} />}
              iconPosition="end"
            >
              Next: Images
            </Button>
          )}
        </div>

        {/* ✅ Delete Modal integrated here */}
        <DeleteModal
          isOpen={showDeleteModal}
          item={deleteTarget}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      </div>
    );
  }
};

export default MenuForm;
