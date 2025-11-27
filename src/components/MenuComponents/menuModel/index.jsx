import React, { useEffect, useState } from "react";
import styles from "./MenuModal.module.scss";
import { X, Loader2, Trash2, ImagePlus } from "lucide-react";
import { updateMenuItem, getMenuCategories } from "../../../services/restaurantDashboardService";
import Button from "../../Button";
import { useToast } from "../../../contexts/ToastContext";

const MenuModal = ({
  isOpen,
  onClose,
  menu,
  handleGetMenuItems,
  businessType,
}) => {
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const hasPredefinedCategories = fetchedCategories.length > 0;
  const categoryOptions = fetchedCategories;

  useEffect(() => {
    const fetchCategories = async () => {
      if (businessType) {
        const response = await getMenuCategories(businessType);
        const apiData = response.data?.data;
        
        if (response.success && Array.isArray(apiData)) {
          const formattedCategories = apiData.map((cat) => {
            if (typeof cat === "string") {
              return { value: cat, label: cat };
            }
            return {
              value: cat.name || cat.value || cat,
              label: cat.name || cat.label || cat,
            };
          });
          setFetchedCategories(formattedCategories);
        }
      }
    };
    fetchCategories();
  }, [businessType]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    prep_time: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    category: "",
    prep_time: "",
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
        prep_time: menu?.prep_time || "",
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
    const newErrors = { name: "", price: "", category: "", prep_time: "" };
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required.";
      hasError = true;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0.";
      hasError = true;
    }

    if (!formData.prep_time || Number(formData.prep_time) <= 0) {
      newErrors.prep_time = "Duration must be greater than 0.";
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

    setErrors({ name: "", price: "", category: "", prep_time: "" });

    try {
      setUpdating(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("description", formData.description);
      payload.append("prep_time", formData.prep_time);
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

          <label>Duration (minutes)</label>
          <input
            type="number"
            className={errors.prep_time ? styles.inputError : ""}
            value={formData.prep_time}
            onChange={(e) => {
              setFormData({ ...formData, prep_time: e.target.value });
              if (errors.prep_time) setErrors({ ...errors, prep_time: "" });
            }}
            placeholder="15"
          />
          {errors.prep_time && <p className={styles.errorText}>{errors.prep_time}</p>}

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
