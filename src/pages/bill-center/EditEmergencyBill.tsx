// src/components/emergencyBills/EditEmergencyBill.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { useProviderContext } from "../../context/useProviderContext";
import { 
  fetchEmergencyBillDetails, 
//   updateEmergencyBill 
} from "../../services/thunks/emergencyBillsThunk";
import { clearCurrentBill, clearError } from "../../services/slices/emergencyBillSlice";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { X, Save, Plus, Trash2 } from "lucide-react";
import FormSelect from "../../components/form/FormSelect";
import { dischargeTypeOptions, serviceTypeOptions } from "../../utils/emergencyBillUtils";
import type { RootState } from "../../services/store/store";
import { useSelector } from "react-redux";
import { fetchDepartments } from "../../services/thunks/departmentThunk";


const EditEmergencyBill = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProviderId } = useProviderContext();

    // Department state
    const {
      departments,
   
    } = useSelector((state: RootState) => state.departments);

  // Get emergency bill details from Redux state
  const { currentBill, loading, error } = useAppSelector(
    (state) => state.emergencyBills
  );

  // Local state for editable form
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch emergency bill details when component mounts
  useEffect(() => {
    if (billId && selectedProviderId) {
      dispatch(fetchEmergencyBillDetails({ 
        emergencyBillId: billId, 
        providerId: selectedProviderId 
      }));
    }
  }, [billId, selectedProviderId, dispatch]);

  // Initialize form data when currentBill is loaded
  useEffect(() => {
    if (currentBill) {
      setFormData({
        ...currentBill,
        diagnoses: currentBill.diagnoses ? [...currentBill.diagnoses] : [{
          type: "",
          code: "",
          diagnosis: "",
          note: ""
        }],
        productServices: currentBill.productServices ? [...currentBill.productServices] : [{
          productId: "",
          quantity: 0,
          price: 0,
          flag: ""
        }],
        serviceCategories: currentBill.serviceCategories ? [...currentBill.serviceCategories] : [""]
      });
    }
  }, [currentBill]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentBill());
      dispatch(clearError());
    };
  }, [dispatch]);
  // useEffect to get list of departments
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch])

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle diagnosis changes
  const handleDiagnosisChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const newDiagnoses = [...prev.diagnoses];
      newDiagnoses[index] = {
        ...newDiagnoses[index],
        [field]: value
      };
      return {
        ...prev,
        diagnoses: newDiagnoses
      };
    });
  };

  // Handle product service changes
  const handleProductServiceChange = (index: number, field: string, value: string | number) => {
    setFormData((prev: any) => {
      const newProductServices = [...prev.productServices];
      newProductServices[index] = {
        ...newProductServices[index],
        [field]: field === 'quantity' || field === 'price' ? Number(value) : value
      };
      return {
        ...prev,
        productServices: newProductServices
      };
    });
  };

  // Handle service category changes
  const handleServiceCategoryChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newServiceCategories = [...prev.serviceCategories];
      newServiceCategories[index] = value;
      return {
        ...prev,
        serviceCategories: newServiceCategories
      };
    });
  };

  // Add new diagnosis
  const addDiagnosis = () => {
    setFormData((prev: any) => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        { type: "", code: "", diagnosis: "", note: "" }
      ]
    }));
  };

  // Remove diagnosis
  const removeDiagnosis = (index: number) => {
    if (formData.diagnoses.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        diagnoses: prev.diagnoses.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  // Add new product service
  const addProductService = () => {
    setFormData((prev: any) => ({
      ...prev,
      productServices: [
        ...prev.productServices,
        { productId: "", quantity: 0, price: 0, flag: "" }
      ]
    }));
  };

  // Remove product service
  const removeProductService = (index: number) => {
    if (formData.productServices.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        productServices: prev.productServices.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  // Add new service category
  const addServiceCategory = () => {
    setFormData((prev: any) => ({
      ...prev,
      serviceCategories: [...prev.serviceCategories, ""]
    }));
  };

  // Remove service category
  const removeServiceCategory = (index: number) => {
    if (formData.serviceCategories.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        serviceCategories: prev.serviceCategories.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!billId || !selectedProviderId) return;

    setIsSubmitting(true);
    try {
    //   await dispatch(updateEmergencyBill({
    //     emergencyBillId: billId,
    //     providerId: selectedProviderId,
    //     data: formData
    //   })).unwrap();
      
    
    //   navigate(`/emergency-bills/${billId}`);
    } catch (error) {
      console.error('Failed to update bill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading || !formData) {
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
    <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Edit Bill</h2>
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Form Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
           {/* <div className="col-span-2"> */}
              <FormSelect
                label="Enter name"
              
                required
                
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </FormSelect>
            {/* </div> */}
              
              <div>
                  <FormSelect
                label="Service Type"
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
                />
              </div>

                    {/* Discharge status selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discharge status
              </label>
              <FormSelect
                label="Discharge Status"
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
            {formData.diagnoses.map((diagnosis: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Diagnosis {index + 1}</h4>
                  {formData.diagnoses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDiagnosis(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={diagnosis.type || ""}
                      onChange={(e) => handleDiagnosisChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      value={diagnosis.code || ""}
                      onChange={(e) => handleDiagnosisChange(index, 'code', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      value={diagnosis.diagnosis || ""}
                      onChange={(e) => handleDiagnosisChange(index, 'diagnosis', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note
                    </label>
                    <textarea
                      value={diagnosis.note || ""}
                      onChange={(e) => handleDiagnosisChange(index, 'note', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addDiagnosis}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Add Diagnosis
            </button>
          </Section>

          {/* Service Categories */}
          <Section title="Service Categories">
            {formData.serviceCategories.map((category: string, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={category || ""}
                  onChange={(e) => handleServiceCategoryChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                {formData.serviceCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceCategory(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addServiceCategory}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Add Service Category
            </button>
          </Section>

          {/* Product Services */}
          <Section title="Product Services">
            {formData.productServices.map((service: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  {formData.productServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductService(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID
                    </label>
                    <input
                      type="text"
                      value={service.productId || ""}
                      onChange={(e) => handleProductServiceChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={service.quantity || 0}
                      onChange={(e) => handleProductServiceChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={service.price || 0}
                      onChange={(e) => handleProductServiceChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flag
                    </label>
                    <input
                      type="text"
                      value={service.flag || ""}
                      onChange={(e) => handleProductServiceChange(index, 'flag', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProductService}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Add Product Service
            </button>
          </Section>

          {/* Supporting Documents */}
          <Section title="Supporting Documents">
            <div className="space-y-2">
              {formData.supportingDocuments?.map((doc: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => {
                      const newDocs = [...formData.supportingDocuments];
                      newDocs[index] = e.target.value;
                      setFormData((prev: any) => ({
                        ...prev,
                        supportingDocuments: newDocs
                      }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Document URL"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    supportingDocuments: [...(prev.supportingDocuments || []), ""]
                  }));
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Add Document URL
              </button>
            </div>
          </Section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
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