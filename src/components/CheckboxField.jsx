import { forwardRef } from 'react';

const CheckboxField = forwardRef(({
  label,
  name,
  checked,
  onChange,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        name={name}
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      <label
        htmlFor={name}
        className="ml-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
