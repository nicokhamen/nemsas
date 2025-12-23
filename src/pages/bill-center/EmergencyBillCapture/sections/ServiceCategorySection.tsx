interface ServiceCategorySectionProps {
  categories: Array<{ id: string; name: string }>;
  selectedMedicalHistory: string[];
  onMedicalHistoryChange: (categoryId: string) => void;
}

export default function ServiceCategorySection({
  categories,
  selectedMedicalHistory,
  onMedicalHistoryChange,
}: ServiceCategorySectionProps) {
  return (
    <div className="col-span-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Service Category (Please check)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center">
            <input
              type="checkbox"
              id={`medical-${category.id}`}
              checked={selectedMedicalHistory.includes(category.id)}
              onChange={() => onMedicalHistoryChange(category.id)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor={`medical-${category.id}`}
              className="ml-2 text-gray-700 cursor-pointer"
            >
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}