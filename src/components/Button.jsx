import React from "react";
import styles from "./MenuComponents/styles/Button.module.scss";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary
  size = "medium", // small, medium, large
  icon,
  iconPosition = "start", // start, end
  disabled = false,
  className = "",
  secondIcon = null,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconClasses = [styles.icon, iconPosition === "end" && styles.iconEnd]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "start" && (
        <span className={iconClasses}>{icon}</span>
      )}
      <span className={styles.text}>{children}</span>
      {icon && iconPosition === "end" && (
        <span className={iconClasses}>{icon}</span>
      )}
      {secondIcon && <span className={iconClasses}>{secondIcon}</span>}
    </button>
  );
};

export default Button;
