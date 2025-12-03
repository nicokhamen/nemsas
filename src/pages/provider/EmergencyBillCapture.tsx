import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import FormSelect from "../../components/form/FormSelect";
import Input from "../../components/form/Input";
import Button from "../../components/ui/Button";
import type { AppDispatch, RootState } from "../../services/store/store";
import {
  dischargeTypeOptions,
  serviceTypeOptions,
} from "../../utils/emergencyBillUtils";
import {
  fetchDepartments,
  fetchServiceCategories,
} from "../../services/thunks/emergencyBillThunk";
import { ICDSearch } from "../../components/ui/ICDSearch";
import type { ICDItem } from "../../types/emergency-bill";
import { FileUpload } from "../../components/FileUpload";
import {
  ProductServiceSearch,
  type ProductServiceItem,
} from "../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../components/ui/ProductServiceTable";
import type { ProductItem } from '../../types/productType';



// Define Diagnosis type
interface Diagnosis {
  id: string;
  type: string; // Display type (ICD-10 or ICD-11)
  code: string;
  name: string;
  note: string;
}

export default function EmergencyBillCapture() {
  const dispatch = useDispatch<AppDispatch>();

  // Department state
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useSelector((state: RootState) => state.departments);

  // Service category state
  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.serviceCategories
  );

  // Local state
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<
    string[]
  >([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([
    {
      id: "1",
      type: "ICD-10",
      code: "E11.9",
      name: "Type 2 diabetes mellitus",
      note: "Type 2 diabetes mellitus without complications",
    },
  ]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  // file upload
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // Refs to track fetched data
  const hasFetchedDepartmentsRef = useRef(false);
  const hasFetchedCategoriesRef = useRef(false);

  const [productServiceItems, setProductServiceItems] = useState<ProductItem[]>([]);
  // const [productServiceItems, setProductServiceItems] = useState<
  //   ProductServiceItem[]
  // >([
  //   {
  //     id: "1",
  //     code: "LAB-001",
  //     name: "Fasting lipid profile (CHEM PATH)",
  //     description:
  //       "Complete lipid panel including cholesterol, triglycerides, HDL, LDL",
  //     category: "Laboratory",
  //     price: 3150.0,
  //     nhisPercent: 0,
  //     nhisAmount: 0.0,
  //     netAmount: 3150.0,
  //     isCovered: false,
  //     flag: "Not Covered",
  //   },
  //   {
  //     id: "2",
  //     code: "LAB-002",
  //     name: "Full Blood Count (FBC) (RBC, WBC)",
  //     description: "Complete blood count with differential",
  //     category: "Laboratory",
  //     price: 1500.0,
  //     nhisPercent: 0,
  //     nhisAmount: 0.0,
  //     netAmount: 1500.0,
  //     isCovered: true,
  //     flag: "",
  //   },
  // ]);

 const handleProductServiceSelect = (item: ProductItem) => {
  // Check if item already exists
  const exists = productServiceItems.some(
    (existingItem) => existingItem.id === item.id
  );
  if (!exists) {
    setProductServiceItems((prev) => [...prev, item]);
  }
};

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
  // For now, just update the item (quantity would affect price calculations)
  console.log(`Update quantity for ${id} to ${newQuantity}`);
  // In a real implementation, you would update the quantity in the state
  // and recalculate the totals
};

 const handleRemoveProductService = (id: string) => {
  setProductServiceItems((prev) => prev.filter((item) => item.id !== id));
};

  // Fetch data on component mount
  useEffect(() => {
    if (!hasFetchedDepartmentsRef.current && !departmentsLoading) {
      hasFetchedDepartmentsRef.current = true;
      dispatch(fetchDepartments());
    }

    if (!hasFetchedCategoriesRef.current && !categoriesLoading) {
      hasFetchedCategoriesRef.current = true;
      dispatch(fetchServiceCategories());
    }
  }, [dispatch, departmentsLoading, categoriesLoading]);

  // Handle checkbox changes
  const handleMedicalHistoryChange = (categoryId: string) => {
    setSelectedMedicalHistory((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDiagnosisChange = (id: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleFiles = (files: File[]) => {
    setUploadedFiles(files);
    console.log("Selected files:", files);
  };

  // Handle ICD search selection
  const handleSelect = (selectedItem: ICDItem & { type: string }) => {
    const newId = Date.now().toString(); // Use timestamp for unique ID
    const newDiagnosis: Diagnosis = {
      id: newId,
      type: selectedItem.type,
      code: selectedItem.code,
      name: selectedItem.name,
      note: `Selected from search: ${selectedItem.name}`,
    };

    setDiagnosisList((prev) => [...prev, newDiagnosis]);
    // Auto-select the newly added diagnosis
    setSelectedDiagnoses((prev) => [...prev, newId]);
  };

  // Handle remove diagnosis
  const handleRemoveDiagnosis = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiagnosisList((prev) => prev.filter((item) => item.id !== id));
    setSelectedDiagnoses((prev) => prev.filter((itemId) => itemId !== id));

    // Clear editing state if removing the item being edited
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setNoteInput("");
    }
  };

  // Handle note editing
  const handleEditNote = (id: string) => {
    const item = diagnosisList.find((d) => d.id === id);
    setEditingNoteId(id);
    setNoteInput(item?.note || "");
  };

  const handleSaveNote = (id: string) => {
    setDiagnosisList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: noteInput } : item))
    );
    setEditingNoteId(null);
    setNoteInput("");
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteInput("");
  };

  return (
    <>
      <form>
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Emergency Bill Capture
              </h1>
            </div>

            {/* Main Card Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Ward/Clinic Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Ward/ Clinic
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Department Dropdown */}
                  <div>
                    <FormSelect
                      label="Enter name"
                      name="department"
                      required
                      isLoading={departmentsLoading}
                      error={departmentsError}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  {/* Service Type Dropdown */}
                  <div>
                    <FormSelect
                      label="Service Type"
                      name="serviceType"
                      required
                    >
                      <option value="">-----</option>
                      {serviceTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </div>
              </div>

              {/* Encounter Start Date Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Encounter Start Date/Time
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date */}
                  <Input
                    type="date"
                    name="startDate"
                    label="start date"
                    placeholder="mm/dd/yyyy"
                  />

                  {/* Discharge Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discharge status
                    </label>
                    <FormSelect name="dischargeStatus" label="discharge Status">
                      <option value="">---</option>
                      {dischargeTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  {/* Discharge Date */}
                  <Input
                    type="date"
                    label="discharge date"
                    name="dischargeDate"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>

              {/* Medical History Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Medical History (Please check)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`medical-${category.id}`}
                        checked={selectedMedicalHistory.includes(category.id)}
                        onChange={() => handleMedicalHistoryChange(category.id)}
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

              {/* Type Section (Diagnosis Table) */}
              <div className="p-6 border-b border-gray-200">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Diagnosis Search & Selection
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Select ICD version and type at least 3 characters to search
                    for diagnoses. Select a diagnosis to add it to the table
                    below.
                  </p>
                  <ICDSearch onSelect={handleSelect} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-40">
                          Type
                        </th>
                        <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-32">
                          Code
                        </th>
                        <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                          Diagnosis
                        </th>
                        <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                          Note
                        </th>
                        <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-32">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosisList.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 ${
                            selectedDiagnoses.includes(item.id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {/* Type column with checkbox */}
                          <td className="border border-gray-300 p-3">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedDiagnoses.includes(item.id)}
                                onChange={() => handleDiagnosisChange(item.id)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="ml-3 font-medium text-gray-800">
                                {item.type}
                              </span>
                            </label>
                          </td>

                          {/* Code column */}
                          <td className="border border-gray-300 p-3">
                            <code className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                              {item.code}
                            </code>
                          </td>

                          {/* Diagnosis column */}
                          <td className="border border-gray-300 p-3">
                            <span className="text-gray-800">{item.name}</span>
                          </td>

                          {/* Note column */}
                          <td className="border border-gray-300 p-3">
                            {editingNoteId === item.id ? (
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter note..."
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(item.id)}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelNote}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : item.note ? (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">
                                  {item.note}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleEditNote(item.id)}
                                  className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEditNote(item.id)}
                                className="text-gray-400 hover:text-gray-600 text-sm flex items-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Add note
                              </button>
                            )}
                          </td>

                          {/* Action column */}
                          <td className="border border-gray-300 p-3">
                            <button
                              type="button"
                              onClick={(e) => handleRemoveDiagnosis(item.id, e)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 hover:border-red-300 text-sm transition-colors flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {diagnosisList.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No diagnoses added yet. Use the search above to add
                    diagnoses.
                  </div>
                )}
              </div>

              {/* Upload Supporting Documents Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Upload Supporting Documents
                </h2>

                <FileUpload onFilesSelected={handleFiles} />
              </div>

              {/* Attending Physician Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Attending Physician
                </h2>
                <div className="max-w-md">
                  <Input
                    type="text"
                    name="physician"
                    label="Enter physician name"
                  />
                </div>
              </div>

              {/* Product/Service Section */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Product/Service:
                  </h2>
                  <div className="max-w-md">
                    <Input
                      type="text"
                      name="searchProduct"
                      label="Search for Product/Service"
                    />
                  </div>
                </div>

                {/* Product/Service Table */}
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Product/Service:
                    </h2>
                    <div className="max-w-3xl mb-6">
                      <ProductServiceSearch
                        onSelect={handleProductServiceSelect}
                        selectedItems={productServiceItems}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Type at least 2 characters to search for products or
                        services
                      </p>
                    </div>

                    <ProductServiceTable
                      items={productServiceItems}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveProductService}
                    />
                  </div>

                  {/* Total Amount and Save Button */}
                  <div className="mt-8 flex justify-between items-center">
                    <div className="text-lg font-semibold text-gray-800">
                      Total Amount: ₦60,500
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="px-6 py-2.5 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
