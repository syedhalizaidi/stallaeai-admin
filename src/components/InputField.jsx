import React, { forwardRef } from "react";
import styles from "./MenuComponents/styles/Custom.module.scss";

const InputField = forwardRef(({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon,
  error,
  ...props
}, ref) => {
  return (
    <div className={`${styles.formGroup}`}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputContainer}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          {...props}
        />
      </div>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField; 