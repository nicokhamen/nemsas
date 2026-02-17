// file for supporting docs

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
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
} from "../../services/thunks/departmentThunk";
import { FileUpload } from "../../components/FileUpload";
import { ProductServiceSearch } from "../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../components/ui/ProductServiceTable";
import type { ProductItem } from "../../types/productType";
import { createEncounter } from "../../services/thunks/departmentThunk";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useCustomToast } from "../../hooks/useCustomToast";
import { useNavigate } from "react-router-dom";
import { DiagnosisSearchTable } from "../../components/ui/DIagnosisSearchTable";
import { fileToBase64 } from "../../utils/fileUtils";
import type { EncounterFormData, ProductService, Diagnosis as DiagnosisType,  } from "../../types/encounter";


// Define local Diagnosis type (different from the exported one)
interface Diagnosis {
  id: string;
  type: string; // Display type (ICD-10 or ICD-11)
  code: string;
  name: string;
  note: string;
}

interface EmergencyBillCaptureProps {
  patientId: string; // Passed from parent component
}

export default function EmergencyBillCapture({
  patientId,
}: EmergencyBillCaptureProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success: toastSuccess } = useCustomToast();
  const navigate = useNavigate();

  const routeToAllPatients = useCallback(() => {
    navigate("/emergency/bills");
  }, [navigate]);

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

  const {
    loading: billLoading,
    error: billError,
    success: billSuccess,
  } = useSelector((state: RootState) => state.encounter);

  // Local state - FIXED: Removed duplicate uploadedFiles
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [encounterStartDateTime, setEncounterStartDateTime] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dischargeStatus, setDischargeStatus] = useState<string>("");
  const [dischargeDate, setDischargeDate] = useState<string>("");
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<
    string[]
  >([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([]);
  const [attendingPhysician, setAttendingPhysician] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // SINGLE DECLARATION
  const [productServiceItems, setProductServiceItems] = useState<ProductItem[]>(
    []
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // FIXED: Added isConvertingFiles state for better UX
  const [isConvertingFiles, setIsConvertingFiles] = useState(false);

  // Refs to track fetched data
  const hasFetchedDepartmentsRef = useRef(false);
  const hasFetchedCategoriesRef = useRef(false);

  const handleProductServiceSelect = (item: ProductItem) => {
    const exists = productServiceItems.some(
      (existingItem) => existingItem.id === item.id
    );
    if (!exists) {
      setProductServiceItems((prev) => [...prev, item]);
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setProductServiceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
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

  // FIXED: Added file size validation
  const handleFiles = async (files: File[]) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    setUploadedFiles(files);
    console.log("Selected files:", files);
  };

  const handleNoteChange = (id: string, note: string) => {
    console.log(`Note changed for diagnosis ${id}:`, note);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!patientId) {
      errors.push("Please register a patient first");
    }

    if (!selectedDepartment) {
      errors.push("Please select a department");
    }

    if (!selectedServiceType) {
      errors.push("Please select a service type");
    }

    if (diagnosisList.length === 0) {
      errors.push("Please add at least one diagnosis");
    }

    if (!attendingPhysician.trim()) {
      errors.push("Please enter attending physician name");
    }

    if (productServiceItems.length === 0) {
      errors.push("Please add at least one product/service");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
      }
      return;
    }

    setShowConfirmModal(true);
  };

  // Handle confirmation from modal
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);

    try {
      setIsConvertingFiles(true);
      
      // Convert uploaded files to base64 if any
      // const supportingDocuments: SupportingDocument[] = [];
      const supportingDocuments: string[] = [];
      
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            const base64Content = await fileToBase64(file);
             supportingDocuments.push(base64Content);
          } catch (error) {
            console.error(`Error converting file ${file.name}:`, error);
          }
        }
      }

      // Prepare data for submission - FIXED: Type alignment
      const diagnoses: DiagnosisType[] = diagnosisList
        .filter((diagnosis) => selectedDiagnoses.includes(diagnosis.id))
        .map((diagnosis) => ({
          type: diagnosis.type,
          code: diagnosis.code,
          diagnosis: diagnosis.name, // Note: 'name' in local vs 'diagnosis' in type
          note: diagnosis.note,
        }));

      const serviceCategories = selectedMedicalHistory;

      const productServices: ProductService[] = productServiceItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
        flag: "ACTIVE",
      }));

      // Prepare encounter data - FIXED: Added missing type annotations
      const encounterData: EncounterFormData = {
        patientId: patientId,
        department: selectedDepartment,
        serviceType: selectedServiceType,
        encounterStartDateTime: new Date(encounterStartDateTime).toISOString(),
        dischargeStatus: dischargeStatus,
        dischargeDate: dischargeDate ? new Date(dischargeDate).toISOString() : "",
        diagnoses: diagnoses,
        serviceCategories: serviceCategories,
        productServices: productServices,
        attendingPhysician: attendingPhysician,
        supportingDocuments: supportingDocuments,
      };

      console.log("Submitting encounter data with supporting documents:", encounterData);

      // Dispatch the createEncounter action
      dispatch(createEncounter(encounterData));
      toastSuccess("Bill created successfully");
      
    } catch (error) {
      console.error("Error preparing data:", error);
      alert("Error processing files. Please try again.");
    } finally {
      setIsConvertingFiles(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowConfirmModal(false);
  };

  // Handle successful submission - FIXED: Added missing dependencies
  useEffect(() => {
    if (billSuccess) {
      // Reset form
      setSelectedDepartment("");
      setSelectedServiceType("");
      setEncounterStartDateTime(new Date().toISOString().split("T")[0]);
      setDischargeStatus("");
      setDischargeDate("");
      setSelectedMedicalHistory([]);
      setSelectedDiagnoses([]);
      setDiagnosisList([]);
      setAttendingPhysician("");
      setUploadedFiles([]);
      setProductServiceItems([]);
      setValidationErrors([]);
      
      // Navigate after successful submission
      routeToAllPatients();
    }

    if (billError) {
      alert(`Error creating emergency bill: ${billError}`);
    }
  }, [billSuccess, billError, routeToAllPatients]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Emergency Bill Capture
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormSelect
                label="Enter name"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
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

            <div>
              <FormSelect
                label="Service Type"
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={encounterStartDateTime}
                onChange={(e) => setEncounterStartDateTime(e.target.value)}
                className="w-full border rounded-xl p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discharge status
              </label>
              <FormSelect
                label="Discharge Status"
                value={dischargeStatus}
                onChange={(e) => setDischargeStatus(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discharge Date
              </label>
              <input
                type="date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="w-full border rounded-xl p-2"
              />
            </div>

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

            <div>07</div>
          </div>
        </div>

        <DiagnosisSearchTable
          diagnoses={diagnosisList}
          selectedDiagnoses={selectedDiagnoses}
          onDiagnosesChange={setDiagnosisList}
          onSelectionChange={setSelectedDiagnoses}
          onNoteChange={handleNoteChange} 
          maxHeight="500px" 
          className="my-6" 
        />

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upload Supporting Documents
          </h2>
          <FileUpload onFilesSelected={handleFiles} />
          {uploadedFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {uploadedFiles.length} file(s) selected
            </div>
          )}
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Attending Physician
          </h2>
          <div className="max-w-md">
            <Input
              type="text"
              value={attendingPhysician}
              onChange={(e) => setAttendingPhysician(e.target.value)}
              label="Enter physician name"
              required
            />
          </div>
        </div>

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
                Type at least 2 characters to search for products or services
              </p>
            </div>

            <ProductServiceTable
              items={productServiceItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveProductService}
            />
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={billLoading || isConvertingFiles}
                className={`px-6 py-2.5 ${
                  billLoading || isConvertingFiles
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isConvertingFiles ? "Processing files..." : 
                 billLoading ? "Submitting..." : "Submit Emergency Bill"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmSubmit}
        title="Confirm Emergency Bill Submission"
        message={`Are you sure you want to submit this emergency bill? 
        

        • Total Amount: $${productServiceItems
          .reduce(
            (total, item) => total + (item.price || 0) * (item.quantity || 1),
            0
          )
          .toFixed(2)}
        
        • Supporting Documents: ${uploadedFiles.length} file(s)
        
        This action cannot be undone.`}
        confirmText="Submit Bill"
        cancelText="Cancel"
        type="warning"
        isLoading={billLoading || isConvertingFiles}
      />
    </>
  );

}