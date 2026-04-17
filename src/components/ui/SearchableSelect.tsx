import React, { useState, useMemo, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
  meta?: any;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onSelect: (option: Option) => void;
  error?: string;
  placeholder?: string;
  onInputChange?: (input: string) => void;
  minSearchLength?: number;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onSelect,
  error,
  placeholder = "Search...",
  onInputChange,
}) => {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  

  // Filter options
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, options]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <div className="relative w-full mb-4" ref={ref}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        // onChange={(e) => setQuery(e.target.value)}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);

          // ✅ notify parent (your thunk trigger)
          if (onInputChange) {
            onInputChange(val);
          }
        }}
        className={`w-full border rounded-md px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#DC2626] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {label && (
        <label className="absolute left-3 -top-1 text-xs bg-white px-1 text-gray-500">
          {label}
        </label>
      )}

      {open && (
        <div className="absolute z-50 w-full bg-white border mt-1 rounded-md max-h-60 overflow-y-auto shadow">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setQuery(opt.label);
                  onSelect(opt);
                  setOpen(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-400">No results found</div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
    </>
  );
};

export default SearchableSelect;
