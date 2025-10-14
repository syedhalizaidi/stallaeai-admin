import { forwardRef } from 'react';

const TextAreaField = forwardRef(({
  label,
  name,
  placeholder,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-left text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        ref={ref}
        rows={rows}
        className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 text-left">{error}</p>
      )}
    </div>
  );
});

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
