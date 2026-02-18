import Button from "../../../../../components/ui/Button";
import { ProductServiceSearch } from "../../../../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../../../../components/ui/ProductServiceTable";
import type { ProductItem } from "../../../../../types/productType";

interface ProductServiceSectionProps {
  productServiceItems: ProductItem[];
  onSelectItem: (item: ProductItem) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function ProductServiceSection({
  productServiceItems,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
}: ProductServiceSectionProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Product/Service:
        </h2>
        
        <div className="max-w-3xl mb-6">
          <ProductServiceSearch
            onSelect={onSelectItem}
            selectedItems={productServiceItems}
          />
          <p className="text-sm text-gray-500 mt-2">
            Type at least 2 characters to search for products or
            services
          </p>
        </div>

        <ProductServiceTable
          items={productServiceItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="flex gap-3">
          <Button
            type="submit"
            className="px-6 py-2.5 bg-red-500 text-white hover:bg-red-600"
          >
            Submit Emergency Bill
          </Button>
        </div>
      </div>
    </div>
  );
}