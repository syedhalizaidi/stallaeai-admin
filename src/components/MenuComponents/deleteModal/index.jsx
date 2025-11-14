import React from "react";
import styles from "./DeleteModal.module.scss";
import { X } from "lucide-react";
import { deleteMenuItem } from "../../../services/restaurantDashboardService";
import { useToast } from "../../../contexts/ToastContext";

const DeleteModal = ({ isOpen, item, onCancel, onConfirm }) => {
  const { showError, showSuccess } = useToast();
  if (!isOpen || !item) return null;

  const handleDelete = () => {
    deleteMenuItem(item.id)
      .then(() => {
        onConfirm(item); // ✅ delete item via parent
        showSuccess(`${item.name} deleted successfully!`);
      })
      .catch((error) => {
        showError(`Failed to delete ${item.name}: ${error.message}`);
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onCancel}>
          <X size={18} />
        </button>

        <h2 className={styles.title}>{item.name}</h2>

        <p className={styles.message}>
          Are you sure you want to delete <strong>{item.name}</strong> from the
          menu?
        </p>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
