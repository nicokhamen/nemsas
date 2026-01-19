// src/components/emergencyBills/EditEmergencyBill.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { useProviderContext } from "../../context/useProviderContext";
import { 
  deleteEmergencyBill,
  fetchEmergencyBillDetails, 
  updateEmergencyBill 
} from "../../services/thunks/emergencyBillsThunk";
import { clearCurrentBill, clearError } from "../../services/slices/emergencyBillSlice";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import FormSelect from "../../components/form/FormSelect";
import { dischargeTypeOptions, serviceTypeOptions } from "../../utils/emergencyBillUtils";
import type { RootState } from "../../services/store/store";
import { useSelector } from "react-redux";
import { fetchDepartments, fetchServiceCategories } from "../../services/thunks/departmentThunk";
import { DiagnosisSearchTable } from "../../components/ui/DIagnosisSearchTable";
import { ProductServiceSearch } from "../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../components/ui/ProductServiceTable";
import type { ProductItem } from "../../types/productType";
import { FileUpload } from "../../components/FileUpload";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useCustomToast } from "../../hooks/useCustomToast";

interface Diagnosis {
  id: string;
  type: string;
  code: string;
  name: string;
  note: string;
}

interface UIProductItem extends ProductItem {
  flag?: string;
}

const EditEmergencyBill = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProviderId } = useProviderContext();
  const { success: toastSuccess, error: toastError } = useCustomToast();

  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.serviceCategories
  );
  
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>([]);
  const [productServiceItems, setProductServiceItems] = useState<UIProductItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { departments } = useSelector((state: RootState) => state.departments);
  const { currentBill, loading, error } = useAppSelector(
    (state) => state.emergencyBills
  );

  const [formData, setFormData] = useState<any>(null);

  // Fetch service categories
  useEffect(() => {
    dispatch(fetchServiceCategories());
  }, [dispatch]);

  // Fetch emergency bill details
  useEffect(() => {
    if (billId && selectedProviderId) {
      dispatch(fetchEmergencyBillDetails({ 
        emergencyBillId: billId, 
        providerId: selectedProviderId 
      }));
    }
  }, [billId, selectedProviderId, dispatch]);

  // Initialize form data
  useEffect(() => {
    if (currentBill) {
      console.log("Current bill loaded:", currentBill);
      
      const formData = {
        ...currentBill,
        diagnoses: currentBill.diagnoses?.length > 0 
          ? [...currentBill.diagnoses] 
          : [{ type: "", code: "", diagnosis: "", note: "" }],
        productServices: currentBill.productServices?.length > 0 
          ? [...currentBill.productServices] 
          : [],
        serviceCategories: currentBill.serviceCategories || []
      };
      setFormData(formData);

      if (currentBill.diagnoses?.length > 0) {
        const diagnosesForTable: Diagnosis[] = currentBill.diagnoses.map((diag: any, index: number) => ({
          id: diag.id || `diagnosis-${index}`,
          type: diag.type || "ICD-10",
          code: diag.code || "",
          name: diag.diagnosis || diag.name || "",
          note: diag.note || ""
        }));
        setDiagnosisList(diagnosesForTable);
        setSelectedDiagnoses(diagnosesForTable.map(d => d.id));
      }

      if (currentBill.serviceCategories) {
        setSelectedMedicalHistory(currentBill.serviceCategories);
      }

      if (currentBill.productServices) {
        const productItems: UIProductItem[] = currentBill.productServices.map((ps: any) => ({
          id: ps.productId || ps.id,
          name: ps.productName || ps.name || ps.product?.name || "",
          description: ps.description || ps.product?.description || "",
          price: ps.price || ps.product?.price || 0,
          quantity: ps.quantity || 1,
          flag: ps.flag || "",
          type: ps.product?.type || "",
          code: ps.product?.code || "",
          productCategory: (ps.product?.productCategory as any) || "Clinical",
          nhisPercentage: ps.product?.nhisPercentage || 0,
          nhisPrice: ps.product?.nhisPrice || 0,
          isCovered: ps.product?.isCovered || false,
          providerId: ps.product?.providerId || selectedProviderId || "",
          isActive: ps.product?.isActive || true,
          createdDate: ps.product?.createdDate || new Date().toISOString()
        }));
        setProductServiceItems(productItems);
      }
    }
  }, [currentBill, selectedProviderId]);

  // Clean up
  useEffect(() => {
    return () => {
      dispatch(clearCurrentBill());
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Fetch departments
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleBack = () => {
    navigate(-1);
  };

  // Delete handlers
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!billId) {
      toastError("Missing bill ID for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(deleteEmergencyBill(billId)).unwrap();
      toastSuccess("Bill Deleted Successfully");
      navigate('/emergency/bills');
    } catch (error: any) {
      console.error('Failed to delete bill:', error);
      toastError(`Delete failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Save handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveModal(true); // Show confirm modal before saving
  };

  const handleConfirmSave = async () => {
    if (!billId || !selectedProviderId || !formData) {
      console.error("Missing required data:", { billId, selectedProviderId, formData });
      toastError("Missing required data");
      return;
    }

    const finalData = {
      id: billId,
      patientId: formData.patientId,
      department: formData.department,
      serviceType: formData.serviceType,
      encounterStartDateTime: formData.encounterStartDateTime,
      dischargeStatus: formData.dischargeStatus,
      dischargeDate: formData.dischargeDate,
      attendingPhysician: formData.attendingPhysician,
      diagnoses: diagnosisList.map(diag => ({
        id: diag.id || undefined,
        type: diag.type,
        code: diag.code,
        diagnosis: diag.name,
        note: diag.note || "",
      })),
      serviceCategories: selectedMedicalHistory,
      productServices: productServiceItems.map(item => ({
        id: item.id || undefined,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        flag: item.flag || "",
        name: item.name,
        description: item.description || "",
      })),
      supportingDocuments: []
    };

    // Validate required fields
    const missingFields = [];
    if (!finalData.patientId) missingFields.push("patientId");
    if (!finalData.department) missingFields.push("department");
    if (!finalData.serviceType) missingFields.push("serviceType");
    if (!finalData.encounterStartDateTime) missingFields.push("encounterStartDateTime");
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      toastError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Dispatching updateEmergencyBill...");
      await dispatch(updateEmergencyBill({
        emergencyBillId: billId,
        updateData: finalData
      })).unwrap();
      
      toastSuccess("Bill Updated Successfully");
      navigate('/emergency/bills'); // Fixed route - should match your route configuration
      
    } catch (error: any) {
      console.error('Failed to update bill:', error);
      toastError(`Update failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setShowSaveModal(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiagnosisNoteChange = (id: string, note: string) => {
    setDiagnosisList(prev => 
      prev.map(d => d.id === id ? { ...d, note } : d)
    );

    setFormData((prev: any) => {
      if (!prev.diagnoses) return prev;
      
      const updatedDiagnoses = prev.diagnoses.map((diag: any, index: number) => {
        const diagnosisId = diag.id || `diagnosis-${index}`;
        if (diagnosisId === id) {
          return { ...diag, note };
        }
        return diag;
      });
      
      return {
        ...prev,
        diagnoses: updatedDiagnoses
      };
    });
  };

  const handleMedicalHistoryChange = (categoryId: string) => {
    const newSelection = selectedMedicalHistory.includes(categoryId)
      ? selectedMedicalHistory.filter((id) => id !== categoryId)
      : [...selectedMedicalHistory, categoryId];
    
    setSelectedMedicalHistory(newSelection);
    
    setFormData((prev: any) => ({
      ...prev,
      serviceCategories: newSelection
    }));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setProductServiceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    setFormData((prev: any) => {
      const updatedProductServices = prev.productServices.map((ps: any) =>
        (ps.productId === id || ps.id === id) 
          ? { ...ps, quantity: newQuantity }
          : ps
      );
      return {
        ...prev,
        productServices: updatedProductServices
      };
    });
  };

  const handleRemoveProductService = (id: string) => {
    setProductServiceItems((prev) => prev.filter((item) => item.id !== id));
    
    setFormData((prev: any) => ({
      ...prev,
      productServices: prev.productServices.filter((ps: any) => 
        !(ps.productId === id || ps.id === id)
      )
    }));
  };

  const handleFiles = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleProductServiceSelect = (item: ProductItem) => {
    const exists = productServiceItems.some(
      (existingItem) => existingItem.id === item.id
    );
    
    if (!exists) {
      const newItem: UIProductItem = {
        ...item,
        flag: "",
        quantity: item.quantity || 1
      };
      setProductServiceItems((prev) => [...prev, newItem]);
      
      setFormData((prev: any) => ({
        ...prev,
        productServices: [
          ...(prev.productServices || []),
          {
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price || 0,
            flag: "",
            productName: item.name
          }
        ]
      }));
    }
  };

  // Show loading state
  if (loading || !formData || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Edit Bill</h2>
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Main Form Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Department"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </FormSelect>
                
                <div>
                  <FormSelect
                    label="Service Type"
                    name="serviceType"
                    value={formData.serviceType || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encounter Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="encounterStartDateTime"
                    value={formData.encounterStartDateTime ? 
                      new Date(formData.encounterStartDateTime).toISOString().slice(0, 16) : ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discharge status
                  </label>
                  <FormSelect
                    label="Discharge Status"
                    name="dischargeStatus"
                    value={formData.dischargeStatus || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Discharge Status</option>
                    {dischargeTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discharge Date
                  </label>
                  <input
                    type="datetime-local"
                    name="dischargeDate"
                    value={formData.dischargeDate ? 
                      new Date(formData.dischargeDate).toISOString().slice(0, 16) : ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    name="attendingPhysician"
                    value={formData.attendingPhysician || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </Section>

            {/* Diagnoses */}
            <Section title="Diagnoses">
              <DiagnosisSearchTable
                diagnoses={diagnosisList}
                selectedDiagnoses={selectedDiagnoses}
                onDiagnosesChange={setDiagnosisList}
                onSelectionChange={setSelectedDiagnoses}
                onNoteChange={handleDiagnosisNoteChange}
                maxHeight="500px"
                className="my-6"
              />
            </Section>

            {/* Service Categories */}
            <Section title="Service Categories">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-category-${category.id}`}
                      checked={selectedMedicalHistory.includes(category.id)}
                      onChange={() => handleMedicalHistoryChange(category.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`service-category-${category.id}`}
                      className="ml-2 text-gray-700 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </Section>

            {/* Product Services */}
            <Section title="Product/Services">
              <div className="max-w-3xl mb-6">
                <ProductServiceSearch
                  onSelect={handleProductServiceSelect}
                  selectedItems={productServiceItems}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Type at least 2 characters to search for products or services
                </p>
              </div>

              <ProductServiceTable
                items={productServiceItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveProductService}
              />
            </Section>

            {/* Supporting Documents */}
            <Section title="Supporting Documents">
              <FileUpload onFilesSelected={handleFiles} />
            </Section>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Emergency Bill"
        message="Are you sure you want to delete this emergency bill? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />

      {/* Save Confirmation Modal */}
      <ConfirmModal
        isOpen={showSaveModal}
        onClose={handleCancelSave}
        onConfirm={handleConfirmSave}
        title="Save Changes"
        message="Are you sure you want to save the changes to this emergency bill?"
        confirmText="Save Changes"
        cancelText="Cancel"
        type="warning"
        isLoading={isSubmitting}
      />
    </>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-sm font-semibold text-red-500 mb-4">{title}</h3>
    {children}
  </div>
);

export default EditEmergencyBill;