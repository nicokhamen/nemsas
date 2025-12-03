import React, { useState } from 'react';
import { Trash2, Edit, Minus, Plus, AlertCircle } from 'lucide-react';
import type { ProductItem } from '../../types/productType';

interface ProductServiceTableProps {
  items: ProductItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<ProductItem>) => void;
}

export const ProductServiceTable: React.FC<ProductServiceTableProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItem
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(1);

  // Calculate derived values
  const calculateNhisAmount = (price: number, nhisPercentage: number) => {
    return (price * nhisPercentage) / 100;
  };

  const calculateNetAmount = (price: number, nhisPercentage: number) => {
    const nhisAmount = calculateNhisAmount(price, nhisPercentage);
    return price - nhisAmount;
  };

  // Get flag based on coverage
  const getFlag = (item: ProductItem) => {
    if (!item.isCovered) return 'Not Covered';
    if (item.nhisPercentage === 0) return 'No NHIS Coverage';
    return '';
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'Not Covered':
        return 'bg-orange-100 text-orange-800';
      case 'No NHIS Coverage':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const currentQuantity = 1; // Assuming quantity is 1 for now
      const newQuantity = Math.max(1, currentQuantity + change);
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleEditQuantity = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditingId(id);
      setTempQuantity(1); // Assuming quantity is 1 for now
    }
  };

  const handleSaveQuantity = (id: string) => {
    onUpdateQuantity(id, tempQuantity);
    setEditingId(null);
  };

  const calculateTotals = () => {
    const totals = items.reduce((acc, item) => {
      const quantity = 1; // Assuming quantity is 1 for now
      const nhisAmount = calculateNhisAmount(item.price, item.nhisPercentage);
      const netAmount = calculateNetAmount(item.price, item.nhisPercentage);
      
      return {
        totalPrice: acc.totalPrice + (item.price * quantity),
        totalNhis: acc.totalNhis + (nhisAmount * quantity),
        totalNet: acc.totalNet + (netAmount * quantity)
      };
    }, { totalPrice: 0, totalNhis: 0, totalNet: 0 });

    return totals;
  };

  const totals = calculateTotals();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products/Services Added</h3>
        <p className="text-gray-600">Search and add products or services to see them listed here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-700">PRODUCT/SERVICE</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700 text-center">QTY</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">PRICE</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700 text-center">NHIS(%)</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">NHIS(R)</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">NET AMOUNT</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Flags</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const nhisAmount = calculateNhisAmount(item.price, item.nhisPercentage);
              const netAmount = calculateNetAmount(item.price, item.nhisPercentage);
              const flag = getFlag(item);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Product/Service Name */}
                  <td className="p-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-mono text-xs text-gray-500 mr-2">{item.code}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.productCategory}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-2">
                      {editingId === item.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={tempQuantity}
                            onChange={(e) => setTempQuantity(parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                          <button
                            onClick={() => handleSaveQuantity(item.id)}
                            className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            disabled={1 <= 1} // Assuming quantity is 1 for now
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">1</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditQuantity(item.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                            title="Edit quantity"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-3">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                  </td>

                  {/* NHIS Percent */}
                  <td className="p-3 text-center">
                    <span className={`font-medium ${item.nhisPercentage > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.nhisPercentage}%
                    </span>
                  </td>

                  {/* NHIS Amount */}
                  <td className="p-3">
                    <span className={`font-medium ${nhisAmount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formatCurrency(nhisAmount)}
                    </span>
                  </td>

                  {/* Net Amount */}
                  <td className="p-3">
                    <span className="font-medium text-blue-600">
                      {formatCurrency(netAmount)}
                    </span>
                  </td>

                  {/* Flags */}
                  <td className="p-3">
                    {flag ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlagColor(flag)}`}>
                        {flag}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-3">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Total Price</h4>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPrice)}</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Total NHIS Coverage</h4>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalNhis)}</p>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Net Amount Payable</h4>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.totalNet)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};