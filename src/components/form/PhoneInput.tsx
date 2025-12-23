import React from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ 
  label, 
  value, 
  onChange, 
  error, 
  placeholder = "Phone Number",
  required = false,
  disabled = false
}) => {

  return (
    <div className="relative w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="phone-input-container">
        <PhoneInput
          defaultCountry="ng"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          inputClassName={`w-full h-12 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] disabled:bg-gray-50 disabled:cursor-not-allowed`}
          countrySelectorStyleProps={{
            buttonClassName: `h-12 border ${error ? 'border-red-500' : 'border-gray-300'} border-r-0 rounded-l-md px-3 flex items-center bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed`,
            dropdownStyleProps: {
              className: "border border-gray-300 rounded-md shadow-lg mt-1 bg-white text-sm",
            },
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhoneNumberInput;