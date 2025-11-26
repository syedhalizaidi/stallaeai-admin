import React, { useEffect, useState } from "react";
import styles from "./MenuModal.module.scss";
import { X, Loader2, Trash2, ImagePlus } from "lucide-react";
import { updateMenuItem } from "../../../services/restaurantDashboardService";
import Button from "../../Button";
import { useToast } from "../../../contexts/ToastContext";

const CATEGORY_MAP = {
  restaurant: [
    { value: "Appetizers", label: "Appetizers" },
    { value: "Soups", label: "Soups" },
    { value: "Salad", label: "Salad" },
    { value: "Main Courses", label: "Main Courses" },
    { value: "Desserts", label: "Desserts" },
    { value: "Beverages", label: "Beverages" },
    { value: "Side Dishes", label: "Side Dishes" },
    { value: "Other", label: "Other" },
  ],
  car_dealership: [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Truck", label: "Truck" },
    { value: "Coupe", label: "Coupe" },
    { value: "Convertible", label: "Convertible" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Van", label: "Van" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Other", label: "Other" },
  ],
  barber: [
    { value: "Haircut", label: "Haircut" },
    { value: "Beard", label: "Beard" },
    { value: "Shave", label: "Shave" },
    { value: "Kids Cut", label: "Kids Cut" },
    { value: "Hair Color", label: "Hair Color" },
    { value: "Facial", label: "Facial" },
    { value: "Packages", label: "Packages" },
    { value: "Other", label: "Other" },
  ],
};

const MenuModal = ({
  isOpen,
  onClose,
  restaurantId,
  menu,
  handleGetMenuItems,
  businessType,
}) => {
  const hasPredefinedCategories = CATEGORY_MAP.hasOwnProperty(businessType);
  const categoryOptions = CATEGORY_MAP[businessType] || [];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [customCategory, setCustomCategory] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // Load menu data into form
  useEffect(() => {
    if (isOpen && menu) {
      const menuCategory = menu?.category || "";
      setFormData({
        name: menu?.name || "",
        price: menu?.price || "",
        description: menu?.description || "",
        category: menuCategory,
      });

      // Check if category is custom (not in predefined list)
      if (hasPredefinedCategories) {
        const isInList = categoryOptions.some(opt => opt.value === menuCategory);
        if (!isInList && menuCategory) {
          setFormData(prev => ({ ...prev, category: "Other" }));
          setCustomCategory(menuCategory);
        } else {
          setCustomCategory("");
        }
      }

      // if existing image exists
      if (menu?.images && menu.images.length > 0) {
        setImagePreview(menu.images[0].image_url);
      } else {
        setImagePreview(null);
      }
      setNewImage(null);
    }
  }, [isOpen, menu, hasPredefinedCategories, categoryOptions]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setNewImage(null);
    showInfo("Image removed — you can upload a new one.");
  };

  const handleUpdate = async () => {
    const newErrors = { name: "", price: "", category: "" };
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required.";
      hasError = true;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0.";
      hasError = true;
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required.";
      hasError = true;
    }

    if (hasPredefinedCategories && formData.category === "Other" && !customCategory.trim()) {
      newErrors.category = "Custom category is required.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      showError("Please correct the highlighted fields.");
      return;
    }

    setErrors({ name: "", price: "", category: "" });

    try {
      setUpdating(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("description", formData.description);
      payload.append(
        "category",
        hasPredefinedCategories && formData.category === "Other"
          ? customCategory
          : formData.category
      );

      if (newImage) {
        payload.append("images", newImage);
      } else if (!imagePreview && menu.images.length > 0) {
        payload.append("delete_image", true);
      }

      const res = await updateMenuItem(menu.id, payload);

      if (res.success) {
        showSuccess("Menu updated successfully!");
        onClose();
        handleGetMenuItems?.();
      } else {
        showError("Update failed");
      }
    } catch (err) {
      console.error(err);
      showError("Error updating menu");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Edit Menu Item</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className={styles.editForm}>
          <div className={styles.imageSection}>
            <label>Image</label>
            {imagePreview ? (
              <div className={styles.imagePreviewContainer}>
                <img
                  src={imagePreview}
                  alt="Menu"
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  className={styles.deleteImageBtn}
                  onClick={handleDeleteImage}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className={styles.imageUpload}>
                <label
                  htmlFor="imageUploadInput"
                  className={styles.uploadLabel}
                >
                  <ImagePlus size={20} /> Upload Image
                </label>
                <input
                  id="imageUploadInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>
          <label>Item Name</label>
          <input
            type="text"
            className={errors.name ? styles.inputError : ""}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="Item Name"
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}

          <label>Category</label>
          {hasPredefinedCategories ? (
            <>
              <select
                className={errors.category ? styles.inputError : ""}
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
              >
                <option value="">Select category</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {formData.category === "Other" && (
                <>
                  <label>Custom Category</label>
                  <input
                    type="text"
                    className={errors.category ? styles.inputError : ""}
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      if (errors.category) setErrors({ ...errors, category: "" });
                    }}
                    placeholder="Enter your category"
                  />
                </>
              )}
            </>
          ) : (
            <input
              type="text"
              className={errors.category ? styles.inputError : ""}
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (errors.category) setErrors({ ...errors, category: "" });
              }}
              placeholder="Enter category"
            />
          )}
          {errors.category && <p className={styles.errorText}>{errors.category}</p>}
         
          <label>Price</label>
          <input
            type="number"
            className={errors.price ? styles.inputError : ""}
            value={formData.price}
            onChange={(e) => {
              setFormData({ ...formData, price: e.target.value });
              if (errors.price) setErrors({ ...errors, price: "" });
            }}
            placeholder="Price"
          />
          {errors.price && <p className={styles.errorText}>{errors.price}</p>}

          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
          />

          <div className={styles.editActions}>
            <Button
              onClick={handleUpdate}
              size="small"
              variant="primary"
              disabled={updating}
            >
              {updating ? (
                <Loader2
                  className={`${styles.loaderIcon} animate-spin`}
                  size={16}
                />
              ) : (
                "Update"
              )}
            </Button>
            <Button onClick={onClose} size="small" variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
