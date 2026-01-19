import React, { type SelectHTMLAttributes, useState } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  endAdornment?: React.ReactNode;
 isLoading?: boolean;
  error?: string | null;
}

const FormSelect: React.FC<SelectProps> = ({
  label,
  endAdornment,
  children,
  isLoading = false,
  error = null,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
   const isDisabled = props.disabled || isLoading;

  return (
    <>
    <div className="relative w-full mb-4">
      <select
        {...props}
        disabled={isDisabled}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(e.target.value !== "");
          props.onBlur?.(e);
        }}
        className={`peer w-full border rounded-md px-3 pr-10 pt-5 pb-2 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#DC2626] 
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          `}
      >
        {/* Show loading or error message as the only option if applicable */}
        {isLoading ? (
          <option value="">...</option>
        ) : error ? (
          <option value=""></option>
        ) : (
          <>
            <option value="" disabled hidden></option>
            {children}
          </>
        )}
      </select>

      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none
          ${focused ? "-top-1 text-xs bg-white px-1" : "top-3 text-sm"}
          ${error ? 'text-red-500' : 'text-gray-500'}
          ${isDisabled ? 'text-gray-400' : ''}
        `}
      >
        {label}
      </label>

      {/* Show error message below the dropdown */}
      {error && !isLoading && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Optional adornment (like dropdown arrow or icon) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        {endAdornment ?? (
          <svg
          className={`w-5 h-5 transition-colors
            ${isDisabled ? 'text-gray-300' : error ? 'text-red-500' : 'text-gray-400'}
            peer-focus:text-[#DC2626]
            `}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
        </>
  );
};

export default FormSelect;
