import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import FormSelect from "../../../components/form/FormSelect";
import Input from "../../../components/form/Input";
import Button from "../../../components/ui/Button";
import type { AppDispatch, RootState } from "../../../services/store/store";
import {
  dischargeTypeOptions,
  serviceTypeOptions,
} from "../../../utils/emergencyBillUtils";
import {
  fetchDepartments,
  fetchServiceCategories,
} from "../../../services/thunks/departmentThunk";
// import { FileUpload } from "../../components/FileUpload";
import { ProductServiceSearch } from "../../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../../components/ui/ProductServiceTable";
import type { ProductItem } from "../../../types/productType";
import { createEncounter } from "../../../services/thunks/departmentThunk";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useCustomToast } from "../../../hooks/useCustomToast";
import { useNavigate } from "react-router-dom";
import { DiagnosisSearchTable } from "../../../components/ui/DIagnosisSearchTable";

// Define Diagnosis type
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
  const { success: toastSuccess, error: toastError } = useCustomToast();
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
    // error: billError,
    success: billSuccess,
  } = useSelector((state: RootState) => state.encounter);

  // Local state
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [encounterStartDateTime, setEncounterStartDateTime] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [encounterEndDateTime, setEncounterEndDateTime] = useState<string>("");
  const [dischargeStatus, setDischargeStatus] = useState<string>("");
  const [dischargeDate, setDischargeDate] = useState<string>("");
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<
    string[]
  >([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([]);
  const [attendingPhysician, setAttendingPhysician] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [productServiceItems, setProductServiceItems] = useState<ProductItem[]>(
    []
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal state
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Validation errors
  const [dateError, setDateError] = useState<string>(""); // Date-specific error

  // Refs to track fetched data
  const hasFetchedDepartmentsRef = useRef(false);
  const hasFetchedCategoriesRef = useRef(false);

  // Date validation function
  const validateDates = (): boolean => {
    setDateError("");
    
    // Parse dates
    const startDate = new Date(encounterStartDateTime);
    const endDate = encounterEndDateTime ? new Date(encounterEndDateTime) : null;
    
    // Check if start date is valid
    if (isNaN(startDate.getTime())) {
      setDateError("Invalid start date");
      return false;
    }
    
    // If end date is provided, validate it
    if (endDate) {
      // Check if end date is valid
      if (isNaN(endDate.getTime())) {
        setDateError("Invalid end date");
        return false;
      }
      
      // Check if end date is after start date
      if (endDate <= startDate) {
        setDateError("End date must be after start date");
        return false;
      }
      
      // Check if end date is in the future (optional, remove if not needed)
      // const now = new Date();
      // if (endDate > now) {
      //   setDateError("End date cannot be in the future");
      //   return false;
      // }
    }
    
    // If discharge date is provided, validate it against encounter dates
    if (dischargeDate) {
      const discharge = new Date(dischargeDate);
      
      if (isNaN(discharge.getTime())) {
        setDateError("Invalid discharge date");
        return false;
      }
      
      // Discharge date should be after start date
      if (discharge < startDate) {
        setDateError("Discharge date cannot be before encounter start date");
        return false;
      }
      
      // If end date exists, discharge date should be after it
      if (endDate && discharge < endDate) {
        setDateError("Discharge date cannot be before encounter end date");
        return false;
      }
    }
    
    return true;
  };

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

  // Handle note editing
  const handleNoteChange = (id: string, note: string) => {
    // You can perform additional logic here if needed
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

    if (!encounterStartDateTime) {
      errors.push("Please select encounter start date");
    }

    // Validate dates
    if (!validateDates() && dateError) {
      errors.push(dateError);
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

    // Clear previous errors
    setValidationErrors([]);
    setDateError("");

    // Validate form
    if (!validateForm()) {
      // If there are errors, show them and don't proceed to modal
      if (validationErrors.length > 0) {
        toastError(validationErrors.join("\n"));
      }
      return;
    }

    // If form is valid, show confirmation modal
    setShowConfirmModal(true);
  };

  // Handle confirmation from modal
  const handleConfirmSubmit = () => {
    // Close modal first
    setShowConfirmModal(false);

    // Double-check validation before submitting
    if (!validateForm()) {
      toastError("Please fix the validation errors before submitting");
      return;
    }

    // Prepare data for submission
    const diagnoses = diagnosisList
      .filter((diagnosis) => selectedDiagnoses.includes(diagnosis.id))
      .map((diagnosis) => ({
        type: diagnosis.type,
        code: diagnosis.code,
        diagnosis: diagnosis.name,
        note: diagnosis.note,
      }));

    const serviceCategories = selectedMedicalHistory;

    const productServices = productServiceItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity || 1,
      price: item.price || 0,
      flag: "ACTIVE",
    }));

    // Prepare encounter data
    const encounterData = {
      patientId: patientId,
      department: selectedDepartment,
      serviceType: selectedServiceType,
      encounterStartDateTime: new Date(encounterStartDateTime).toISOString(),
      encounterEndDateTime: encounterEndDateTime 
        ? new Date(encounterEndDateTime).toISOString() 
        : undefined,
      dischargeStatus: dischargeStatus,
      dischargeDate: dischargeDate ? new Date(dischargeDate).toISOString() : "",
      diagnoses: diagnoses,
      serviceCategories: serviceCategories,
      productServices: productServices,
      attendingPhysician: attendingPhysician,
      supportingDocuments: [],
    };

    console.log("Submitting encounter data:", encounterData);

    // Dispatch the createEncounter action
    dispatch(createEncounter(encounterData))
      .unwrap()
      .then(() => {
        toastSuccess("Bill created successfully");
        routeToAllPatients();
      })
      .catch((error) => {
        toastError(`Error creating emergency bill: ${error.message || "Unknown error"}`);
      });
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowConfirmModal(false);
  };

  // Reset form on successful submission
  useEffect(() => {
    if (billSuccess) {
      setSelectedDepartment("");
      setSelectedServiceType("");
      setEncounterStartDateTime(new Date().toISOString().split("T")[0]);
      setEncounterEndDateTime("");
      setDischargeStatus("");
      setDischargeDate("");
      setSelectedMedicalHistory([]);
      setSelectedDiagnoses([]);
      setDiagnosisList([]);
      setAttendingPhysician("");
      setUploadedFiles([]);
      setProductServiceItems([]);
      setValidationErrors([]);
      setDateError("");
    }
  }, [billSuccess]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          {/* Header section with patient ID display */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Emergency Bill Capture
            </h1>
          </div>

          {/* Main form grid with 3 columns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Department selection - col-span-2 makes it take 2/3 width */}
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
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </FormSelect>
            </div>

            {/* Service type selection */}
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

            {/* Encounter start date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encounter Start Date *
              </label>
              <input
                type="date"
                value={encounterStartDateTime}
                onChange={(e) => {
                  setEncounterStartDateTime(e.target.value);
                  setDateError(""); // Clear error on change
                }}
                className={`w-full border rounded-xl p-2 ${
                  dateError ? "border-red-500" : "border-gray-300"
                }`}
                required
                max={new Date().toISOString().split("T")[0]} // Cannot select future dates
              />
              {dateError && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>

            {/* Encounter end date (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encounter End Date
              </label>
              <input
                type="date"
                value={encounterEndDateTime}
                onChange={(e) => {
                  setEncounterEndDateTime(e.target.value);
                  setDateError(""); // Clear error on change
                }}
                className={`w-full border rounded-xl p-2 ${
                  dateError ? "border-red-500" : "border-gray-300"
                }`}
                min={encounterStartDateTime} // Cannot be before start date
                // max={new Date().toISOString().split("T")[0]} // Cannot select future dates
              />
            </div>

            {/* Discharge date (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discharge Date
              </label>
              <input
                type="date"
                value={dischargeDate}
                onChange={(e) => {
                  setDischargeDate(e.target.value);
                  setDateError(""); // Clear error on change
                }}
                className={`w-full border rounded-xl p-2 ${
                  dateError ? "border-red-500" : "border-gray-300"
                }`}
                min={encounterStartDateTime} // Cannot be before start date
                // max={new Date().toISOString().split("T")[0]} 
              />
            </div>

            {/* Discharge status selection */}
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

            {/* Service category checkboxes */}
            <div className="col-span-3">
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
          </div>
        </div>

        {/* ICD 10 ICD 11 section with search and table */}
        <DiagnosisSearchTable
          diagnoses={diagnosisList}
          selectedDiagnoses={selectedDiagnoses}
          onDiagnosesChange={setDiagnosisList}
          onSelectionChange={setSelectedDiagnoses}
          onNoteChange={handleNoteChange} 
          maxHeight="500px" 
          className="my-6" 
        />

        {/* Attending physician input */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Attending Physician
          </h2>
          <div className="max-w-md">
            <Input
              type="text"
              value={attendingPhysician}
              onChange={(e) => setAttendingPhysician(e.target.value)}
              label="Enter physician name *"
              required
            />
          </div>
        </div>

        {/* Product/service section with search and table */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Product/Service:
            </h2>

            {/* Product/service search component */}
            <div className="max-w-3xl mb-6">
              <ProductServiceSearch
                onSelect={handleProductServiceSelect}
                selectedItems={productServiceItems}
              />
              <p className="text-sm text-gray-500 mt-2">
                Type at least 2 characters to search for products or services
              </p>
            </div>

            {/* Product/service table */}
            <ProductServiceTable
              items={productServiceItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveProductService}
            />
          </div>

          {/* Footer with total amount and submit button */}
          <div className="mt-8 flex justify-between items-center">
            {/* Display validation errors */}
            {validationErrors.length > 0 && (
              <div className="text-red-500 text-sm">
                {validationErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={billLoading}
                className={`px-6 py-2.5 ${
                  billLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {billLoading ? "Submitting..." : "Submit Emergency Bill"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmSubmit}
        title="Confirm Emergency Bill Submission"
        message={`Are you sure you want to submit this emergency bill? 
        

        • Total Amount: N${productServiceItems
          .reduce(
            (total, item) => total + (item.price || 0) * (item.quantity || 1),
            0
          )
          .toFixed(2)}
        
        This action cannot be undone.`}
        confirmText="Submit Bill"
        cancelText="Cancel"
        type="warning"
        isLoading={billLoading}
      />
    </>
  );
}
