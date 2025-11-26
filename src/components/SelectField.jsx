import React from 'react';

const SelectField = ({
    label,
    name,
    value,
    onChange,
    placeholder = "Select an option",
    error,
    disabled = false,
    required = false,
    icon: Icon,
    options = [],
    className = '',
    ...props
}) => {
    const baseSelectClasses = `w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white ${
        error ? 'border-red-500' : 'border-gray-300'
    } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} ${className}`;

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={baseSelectClasses}
                    disabled={disabled}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default SelectField;
