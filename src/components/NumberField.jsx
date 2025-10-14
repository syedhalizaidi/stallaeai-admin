import { forwardRef } from 'react';

const NumberField = forwardRef(({
  label,
  type = 'number',
  placeholder,
  icon: Icon,
  error,
  className = '',
  name,
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
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={name}
          name={name}
          ref={ref}
          type={type}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 text-left">{error}</p>
      )}
    </div>
  );
});

NumberField.displayName = 'NumberField';

export default NumberField;
