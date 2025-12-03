import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, Package, Activity, Heart, Eye, Droplets, Stethoscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../services/thunks/productThunk';
import { setSearchParams } from '../../services/slices/productSlice';
import type { AppDispatch, RootState } from '../../services/store/store';
import type { ProductItem } from '../../types/productType';

interface ProductServiceSearchProps {
  onSelect: (item: ProductItem) => void;
  selectedItems?: ProductItem[];
}

export const ProductServiceSearch: React.FC<ProductServiceSearchProps> = ({
  onSelect,
  selectedItems = []
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: products,
    loading,
    error,
    searchParams,
  } = useSelector((state: RootState) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get icon based on productCategory
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Laboratory':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'Imaging':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'Clinical':
        return <Stethoscope className="w-4 h-4 text-green-500" />;
      case 'Non-Clinical':
        return <Package className="w-4 h-4 text-gray-500" />;
      case 'Surgical':
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      // Update search params and fetch products
      dispatch(setSearchParams({ 
        searchTerm: searchQuery.trim(),
        page: 1,
        pageSize: 10 
      }));
      
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(fetchProducts({ 
          searchTerm: searchQuery.trim(),
          page: 1,
          pageSize: 10 
        }));
        setShowDropdown(true);
      }, 500);
    } else {
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, dispatch]);

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

  const handleItemSelect = (item: ProductItem) => {
    onSelect(item);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      e.preventDefault();
      dispatch(fetchProducts({ searchTerm: searchQuery.trim() }));
      setShowDropdown(true);
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate derived values
  const calculateNhisAmount = (price: number, nhisPercentage: number) => {
    return (price * nhisPercentage) / 100;
  };

  const calculateNetAmount = (price: number, nhisPercentage: number) => {
    const nhisAmount = calculateNhisAmount(price, nhisPercentage);
    return price - nhisAmount;
  };

  // Filter out already selected items
  const filteredProducts = products.filter(product => 
    !selectedItems.some(selected => selected.id === product.id)
  );

  return (
    <div className="w-full space-y-4" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products/services (e.g., lab test, consultation, medication)..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Dropdown Results */}
        {showDropdown && filteredProducts.length > 0 && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-700">
                Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="py-1">
              {filteredProducts.map((item) => {
                const nhisAmount = calculateNhisAmount(item.price, item.nhisPercentage);
                const netAmount = calculateNetAmount(item.price, item.nhisPercentage);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getCategoryIcon(item.productCategory)}
                          <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {item.productCategory}
                          </span>
                          <span className="ml-2 text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {item.code}
                          </span>
                          {!item.isCovered && (
                            <span className="ml-2 text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                              Not Covered
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 mr-4">
                            Price: {formatCurrency(item.price)}
                          </span>
                          {item.nhisPercentage > 0 && (
                            <span className="text-green-600 mr-4">
                              NHIS: {item.nhisPercentage}%
                            </span>
                          )}
                          <span className="font-medium text-blue-600">
                            Net: {formatCurrency(netAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Add to bill"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info message */}
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p className="text-sm text-gray-500 mt-1">
            Type at least 2 characters to search...
          </p>
        )}

        {/* No results message */}
        {searchQuery.length >= 2 && !loading && filteredProducts.length === 0 && !error && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center">
              No products or services found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};