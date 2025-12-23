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
// import { ICDSearch } from "../../components/ui/ICDSearch";
// import type { ICDItem } from "../../types/emergency-bill";
import { FileUpload } from "../../components/FileUpload";
import { ProductServiceSearch } from "../../components/ui/ProductServiceSearch";
import { ProductServiceTable } from "../../components/ui/ProductServiceTable";
import type { ProductItem } from "../../types/productType";
import { createEncounter } from "../../services/thunks/departmentThunk";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useCustomToast } from "../../hooks/useCustomToast";
import { useNavigate } from "react-router-dom";
import { DiagnosisSearchTable } from "../../components/ui/DIagnosisSearchTable";

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

  // Local state
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [productServiceItems, setProductServiceItems] = useState<ProductItem[]>(
    []
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal state
  // const [isFormValid, setIsFormValid] = useState(false); // Form validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Validation errors

  // const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  // const [noteInput, setNoteInput] = useState("");

  // Refs to track fetched data
  const hasFetchedDepartmentsRef = useRef(false);
  const hasFetchedCategoriesRef = useRef(false);

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

  // const handleDiagnosisChange = (id: string) => {
  //   setSelectedDiagnoses((prev) =>
  //     prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
  //   );
  // };

  const handleFiles = (files: File[]) => {
    setUploadedFiles(files);
    console.log("Selected files:", files);
  };

  // Handle ICD search selection
  // const handleSelect = (selectedItem: ICDItem & { type: string }) => {
  //   const newId = Date.now().toString(); // Use timestamp for unique ID
  //   const newDiagnosis: Diagnosis = {
  //     id: newId,
  //     type: selectedItem.type,
  //     code: selectedItem.code,
  //     name: selectedItem.name,
  //     note: `Selected from search: ${selectedItem.name}`,
  //   };

  //   setDiagnosisList((prev) => [...prev, newDiagnosis]);
   
  //   setSelectedDiagnoses((prev) => [...prev, newId]);
  // };

  // Handle remove diagnosis
  // const handleRemoveDiagnosis = (id: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setDiagnosisList((prev) => prev.filter((item) => item.id !== id));
  //   setSelectedDiagnoses((prev) => prev.filter((itemId) => itemId !== id));

   
  //   if (editingNoteId === id) {
  //     setEditingNoteId(null);
  //     setNoteInput("");
  //   }
  // };

  // Handle note editing
  const handleNoteChange = (id: string, note: string) => {
    // You can perform additional logic here if needed
    console.log(`Note changed for diagnosis ${id}:`, note);
  };
  // const handleEditNote = (id: string) => {
  //   const item = diagnosisList.find((d) => d.id === id);
  //   setEditingNoteId(id);
  //   setNoteInput(item?.note || "");
  // };

  // const handleSaveNote = (id: string) => {
  //   setDiagnosisList((prev) =>
  //     prev.map((item) => (item.id === id ? { ...item, note: noteInput } : item))
  //   );
  //   setEditingNoteId(null);
  //   setNoteInput("");
  // };

  // const handleCancelNote = () => {
  //   setEditingNoteId(null);
  //   setNoteInput("");
  // };

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

    // Validate form
    if (!validateForm()) {
      // If there are errors, show them and don't proceed to modal
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
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
    dispatch(createEncounter(encounterData));
    toastSuccess("Bill created successfully");
    routeToAllPatients();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowConfirmModal(false);
  };

  // Handle successful submission
  useEffect(() => {
    // alert("Bill created successfully")

    if (billSuccess) {
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
    }

    if (billError) {
      alert(`Error creating emergency bill: ${billError}`);
    }
  }, [billSuccess, billError]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          {/* Header section with patient ID display */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Emergency Bill Capture
            </h1>
            {/* {patientId && (
              <p className="text-sm text-green-600 mt-1">
                Patient ID: {patientId}
              </p>
            )} */}
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
                  <option key={dept.id} value={dept.id}>
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

            {/* Discharge date (optional) */}
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

            {/* Service category checkboxes */}
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

            {/* Empty column for layout balance */}
            <div>07</div>
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

        {/* File upload section for supporting documents */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upload Supporting Documents
          </h2>
          <FileUpload onFilesSelected={handleFiles} />
        </div>

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
              label="Enter physician name"
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
            {/* <div className="text-lg font-semibold text-gray-800">
              Total Amount: ${productServiceItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)}
            </div> */}
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
        

        • Total Amount: $${productServiceItems
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
