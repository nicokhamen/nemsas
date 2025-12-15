import React, { type InputHTMLAttributes, useState, useCallback } from "react";

interface PhoneNumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  endAdornment?: React.ReactNode;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  endAdornment,
  error,
  value = "",
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  maxLength = 11,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // Handle input change with validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Limit to maxLength (11 digits)
    const truncatedValue = numericValue.slice(0, maxLength);
    
    setInternalValue(truncatedValue);
    onChange?.(truncatedValue);
  }, [onChange, maxLength]);

  // Handle focus
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.value !== "");
    onBlur?.(e);
  }, [onBlur]);

  // Prevent non-numeric input on key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, arrow keys
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 
       'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      return;
    }

    // Prevent non-numeric input
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }

    onKeyDown?.(e);
  }, [onKeyDown]);

  return (
    <div className="relative w-full mb-4">
      <input
        type="tel" 
        inputMode="numeric" 
        pattern="[0-9]*" 
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        {...props}
        className={`peer w-full border rounded-md px-3 pr-10 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#DC2626] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      
      <label
        className={`absolute left-3 text-gray-500 transition-all duration-200 
          ${focused || internalValue ? "-top-1 text-xs bg-white px-1" : "top-3 text-sm"}
          ${error ? "text-red-500" : ""}
        `}
      >
        {label}
      </label>

      {/* Character counter */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        <span className={`text-xs ${internalValue.length >= maxLength ? "text-red-500" : "text-gray-400"}`}>
          {internalValue.length}/{maxLength}
        </span>
        {endAdornment}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;