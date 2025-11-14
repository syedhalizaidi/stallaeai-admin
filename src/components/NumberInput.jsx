import React from "react";
import { ClockIcon } from "./icons";
import styles from "./MenuComponents/styles/Custom.module.scss";

const InputWithIcon = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  iconType = "clock", // "clock" or "currency"
  ...props
}) => {
  const renderIcon = () => {
    if (iconType === "currency") {
      return <span className={styles.currencySymbol}>$</span>;
    } else if (iconType === "clock") {
      return (
        <span className={styles.inputIcon}>
          <ClockIcon />
        </span>
      );
    }
    return null;
  };

  const getInputClass = () => {
    if (iconType === "currency") {
      return styles.priceInput;
    } else if (iconType === "clock") {
      return styles.prepTimeInput;
    }
    return styles.input;
  };

  const getContainerClass = () => {
    if (iconType === "currency") {
      return styles.priceContainer;
    } else if (iconType === "clock") {
      return styles.prepTimeContainer;
    }
    return styles.inputContainer;
  };

  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={getContainerClass()}>
        {renderIcon()}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={getInputClass()}
          {...props}
        />
      </div>
    </div>
  );
};

export default InputWithIcon; 