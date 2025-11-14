import React, { useEffect, useState } from "react";
import styles from "./MenuModal.module.scss";
import { X, Loader2, Trash2, ImagePlus } from "lucide-react";
import { updateMenuItem } from "../../../services/restaurantDashboardService";
import Button from "../../Button";
import { useToast } from "../../../contexts/ToastContext";

const MenuModal = ({
  isOpen,
  onClose,
  restaurantId,
  menu,
  handleGetMenuItems,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // Load menu data into form
  useEffect(() => {
    if (isOpen && menu) {
      setFormData({
        name: menu?.name || "",
        price: menu?.price || "",
        description: menu?.description || "",
      });

      // if existing image exists
      if (menu?.images && menu.images.length > 0) {
        setImagePreview(menu.images[0].image_url);
      } else {
        setImagePreview(null);
      }
      setNewImage(null);
    }
  }, [isOpen, menu]);

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
    try {
      if (!menu?.id) return showError("No item selected");

      setUpdating(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("description", formData.description);
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Item Name"
          />

          <label>Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="Price"
          />

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
