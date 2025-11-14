import React, { useRef } from "react";
import { Plus } from "lucide-react";
import styles from "./styles/Custom.module.scss";

const UploadImageField = ({
  label = "Upload Images",
  name = "images",
  value = [],
  onChange,
  maxImages = 1,
  className = "",
  ...props
}) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      e.target.value = "";
      return;
    }
    onChange && onChange(files);
  };

  const handleRemoveImage = (index) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange && onChange(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className={`${styles.formGroup} ${styles.uploadImageHorizontal} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.uploadImageRow}>
        <button
          type="button"
          className={styles.uploadImageButton}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={value.length >= maxImages}
        >
          <Plus size={40} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
          {...props}
        />
        <div className={styles.previewContainer}>
          {value && value.length > 0 && value.map((file, idx) => (
            <div key={idx} className={styles.previewItem}>
              <img
                src={file instanceof File ? URL.createObjectURL(file) : file}
                alt={`preview-${idx}`}
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveImage(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.helperText}>
        {`You can upload up to ${maxImages} images. (Optional)`}
      </div>
    </div>
  );
};

export default UploadImageField;
