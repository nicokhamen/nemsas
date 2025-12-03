import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchICDCodes } from "../../services/thunks/icdThunk";
import type { AppDispatch,RootState } from "../../services/store/store";
import type { ICDItem } from "../../types/emergency-bill";

// Reusable ICD Search Component
export const ICDSearch: React.FC<{ 
  onSelect: (diagnosis: ICDItem & { type: string }) => void,
}> = ({ onSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get ICD state from Redux store
  const {
    data: icdData,
    loading,
    error,
  } = useSelector((state: RootState) => state.icd);
  
  const [system, setSystem] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map UI display to API format
  const getCodeTypeForAPI = (displayType: string): string => {
    const typeMap: Record<string, string> = {
      "ICD-10": "ICD10",
      "ICD-11": "ICD11",
    };
    return typeMap[displayType] || displayType;
  };

  // Format display type
  const formatDisplayType = (apiType: string): string => {
    const typeMap: Record<string, string> = {
      "ICD10": "ICD-10",
      "ICD11": "ICD-11",
    };
    return typeMap[apiType] || apiType;
  };

  // Search with debounce
  const performSearch = useCallback(() => {
    if (query.trim().length >= 3 && system) {
      const apiCodeType = getCodeTypeForAPI(system);
      dispatch(fetchICDCodes({
        codeType: apiCodeType,
        searchTerm: query.trim()
      }));
      setShowDropdown(true);
    }
  }, [query, system, dispatch]);

  // Handle search input with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 3 && system) {
      setIsTyping(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
        setIsTyping(false);
      }, 500); // 500ms debounce
    } else {
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch, system]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (query.trim() && system) {
      performSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() && system) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleItemClick = (item: ICDItem) => {
    const selectedItem = {
      ...item,
      type: formatDisplayType(getCodeTypeForAPI(system))
    };
    
    onSelect(selectedItem);
    setQuery(item.name);
    setShowDropdown(false);
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSystem(e.target.value);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-md space-y-4 p-4 border rounded-2xl shadow">
      <select
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={system}
        onChange={handleSystemChange}
      >
        <option value="">Select ICD Version</option>
        <option value="ICD-10">ICD-10</option>
        <option value="ICD-11">ICD-11</option>
      </select>

      {system && (
        <div className="space-y-3 animate-fadeIn relative" ref={dropdownRef}>
          {/* Search input with icon */}
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Search ${system} ... (Type 3+ letters)`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
              aria-label="Search"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>

          {/* Info message */}
          {query.length > 0 && query.length < 3 && (
            <p className="text-sm text-gray-500">
              Type {3 - query.length} more character{3 - query.length > 1 ? 's' : ''} to search...
            </p>
          )}

          {/* Loading indicator */}
          {isTyping && query.length >= 3 && (
            <p className="text-sm text-blue-500">
              Typing...
            </p>
          )}

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Dropdown for filtered results */}
          {showDropdown && icdData.length > 0 && !loading && !isTyping && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="py-1">
                <div className="px-3 py-2 bg-gray-50 border-b">
                  <p className="text-xs font-medium text-gray-500">
                    Found {icdData.length} result{icdData.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                </div>
                <ul>
                  {icdData.map((item, index) => (
                    <li
                      key={`${item.code}-${index}`}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                              {item.code}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatDisplayType(getCodeTypeForAPI(system))}
                            </span>
                          </div>
                          <p className="text-gray-800">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Click to select</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* No results message */}
          {showDropdown && icdData.length === 0 && query.length >= 3 && !loading && !isTyping && !error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                No ICD codes found for "{query}" in {system}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};