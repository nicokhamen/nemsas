import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Upload,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../services/store/store";
import { useProviderContext } from "../../../context/useProviderContext";
import {
  createEncounter,
  fetchDepartments,
  fetchServiceCategories,
} from "../../../services/thunks/departmentThunk";
import { useCustomToast } from "../../../hooks/useCustomToast";
import { buildEncounterPayload } from "../../../utils/buildEncounterPayload";
import FormSelect from "../../../components/form/FormSelect";
import Input from "../../../components/form/Input";
import Button from "../../../components/ui/Button";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import BillSuccessModal from "../../../components/ui/BillSuccessModal";
import {
  serviceTypeOptions,
  dischargeTypeOptions,
} from "../../../utils/emergencyBillUtils";
import { ProductServiceSearch } from "../../../components/ui/ProductServiceSearch";
import { ICDSearch } from "../../../components/ui/ICDSearch";
import type { ProductItem } from "../../../types/productType";
import PatientFormModal from "../../../components/ui/PatientFormModal";
import { resetEncounterState } from "../../../services/slices/encounterSlice";
import { clearPatientState } from "../../../services/slices/patientSlice";

// Step indicator component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => {
        const isCompleted = step <= currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step icon + label */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  isCompleted
                    ? "bg-[#DC2626] text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <span
                className={`text-lg font-medium ${
                  isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Step {step}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-px w-16 ${
                  step < currentStep ? "bg-[#DC2626]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  hospitalNumber: string;
  phoneNumber?: string;
  gender?: string;
  insuranceStatus?: string;
  dateOfBirth?: string;
  email?: string;
  address?: string;
}

export default function NewEmergencyBillWizard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { success: toastSuccess, error: toastError } = useCustomToast();
  const { selectedProviderId } = useProviderContext();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const resetAllState = useCallback(() => {
    // Reset Redux states
    dispatch(resetEncounterState());
    dispatch(clearPatientState());
    // Add this if you have a patient slice to reset
    // dispatch(resetPatientState());

    // Reset all local states
    setShowSuccess(false);
    setCurrentStep(1);
    setSelectedPatient(null);
    setSearchTerm("");
    setShowSearchResults(false);
    setEncounterData({
      emergencyType: "",
      arrivalType: "",
      attendingClinician: "",
      encounterStartDate: "",
      encounterEndDate: "",
      dischargeStatus: "",
      dischargeDate: "",
      wardClinic: "",
      serviceType: "",
      selectedMedicalHistory: [],
    });
    setDiagnoses([]);
    setServices([]);
    setUploadedFiles([]);
    setCreatedBillId("");

    // Also reset any confirmation modals
    setShowPatientConfirm(false);
    setShowFinalConfirm(false);
    setShowDiagnosisSearch(false);
    setShowProductSearch(false);
  }, [dispatch]);

  // Reset state when component mounts
  useEffect(() => {
    resetAllState();
  }, [resetAllState]);

  const handlePatientRegistered = (patientId: string, patientData?: any) => {
    console.log("New patient registered with ID:", patientId);
    dispatch(resetEncounterState());
    setShowSuccess(false);
    // if (selectedPatient?.id === patientId) {
    //   console.log('Patient already selected, skipping duplicate call');
    //   return;
    // }

    // Create patient object from the registered data
    const newPatient: Patient = {
      id: patientId,
      firstName: patientData?.firstName || "",
      lastName: patientData?.lastName || "",
      hospitalNumber: patientData?.hospitalNumber || "",
      phoneNumber: patientData?.phoneNumber || "",
      gender: patientData?.gender || "",
      insuranceStatus: patientData?.insuranceStatus || "",
      dateOfBirth: patientData?.dateOfBirth || "",
      email: patientData?.email || "",
      address: patientData?.address || "",
    };

    // Set the selected patient (attach to bill)
    setSelectedPatient(newPatient);
    setSearchTerm(`${newPatient.firstName} ${newPatient.lastName}`);

    // Automatically move to step 2 WITHOUT showing confirmation modal
    setCurrentStep(2);

    // Show success toast
    toastSuccess(
      `Patient ${newPatient.firstName} ${newPatient.lastName} created and attached to bill`,
    );

    // Close the patient form modal
    setIsPatientModalOpen(false);

    // Optional: Log the patient data for debugging
    console.log("New patient attached to bill:", newPatient);
  };

  // Redux state
  const { bills: emergencyBills, loading: billsLoading } = useSelector(
    (state: RootState) => state.emergencyBills,
  );

  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useSelector((state: RootState) => state.departments);

  const { categories } = useSelector(
    (state: RootState) => state.serviceCategories,
  );

  const {
    loading: encounterLoading,
    success: encounterSuccess,
    error: encounterError,
  } = useSelector((state: RootState) => state.encounter);

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientConfirm, setShowPatientConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string>("");
  const [showDiagnosisSearch, setShowDiagnosisSearch] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  // Patient search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Step 2: Encounter Details
  const [encounterData, setEncounterData] = useState({
    emergencyType: "",
    arrivalType: "",
    attendingClinician: "",
    encounterStartDate: "",
    encounterEndDate: "",
    dischargeStatus: "",
    dischargeDate: "",
    wardClinic: "",
    serviceType: "",
    selectedMedicalHistory: [] as string[],
  });

  // Step 3: Diagnosis
  const [diagnoses, setDiagnoses] = useState<
    Array<{
      id: string;
      type: string;
      code: string;
      diagnosis: string;
      note: string;
    }>
  >([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  // Step 4: Services & Documents
  const [services, setServices] = useState<ProductItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
  { file: File; preview: string }[]
>([]);

  // Load required data
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchServiceCategories());
  }, [dispatch]);

  // clean up for files
  useEffect(() => {
  return () => {
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  };
}, [uploadedFiles]);

// Clean up object URLs when component unmounts
useEffect(() => {
  return () => {
    uploadedFiles.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
  };
}, []);

  // Extract unique patients from emergency bills
  const availablePatients = useMemo(() => {
    if (!emergencyBills || emergencyBills.length === 0) return [];

    const uniquePatientsMap = new Map();
    emergencyBills.forEach((bill: any) => {
      if (bill.patient && bill.patient.id) {
        uniquePatientsMap.set(bill.patient.id, bill.patient);
      }
    });

    return Array.from(uniquePatientsMap.values());
  }, [emergencyBills]);

  // Search patients
  const searchResults = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];

    const term = searchTerm.toLowerCase();
    return availablePatients.filter((patient: any) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const hospitalNumber = (patient.hospitalNumber || "").toLowerCase();
      return fullName.includes(term) || hospitalNumber.includes(term);
    });
  }, [searchTerm, availablePatients]);

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    dispatch(resetEncounterState());
    setSelectedPatient(patient);
    setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setShowSearchResults(false);
    setShowPatientConfirm(true);
  };

  const confirmPatientSelection = () => {
    setShowPatientConfirm(false);
    setCurrentStep(2);
    toastSuccess("Patient selected successfully");
  };

  // Navigation functions
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Validation for each step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!selectedPatient) {
          toastError("Please select a patient");
          return false;
        }
        return true;
      case 2:
        const requiredFields = [
          "emergencyType",
          "arrivalType",
          "attendingClinician",
          "encounterStartDate",
          "dischargeStatus",
          "wardClinic",
          "serviceType",
        ];
        const missingFields = requiredFields.filter(
          (field) => !encounterData[field as keyof typeof encounterData],
        );
        if (missingFields.length > 0) {
          toastError("Please fill all required fields");
          return false;
        }
        // Validate discharge date if provided
        if (encounterData.dischargeDate && encounterData.encounterStartDate) {
          const dischargeDate = new Date(encounterData.dischargeDate);
          const startDate = new Date(encounterData.encounterStartDate);

          if (dischargeDate < startDate) {
            toastError("Discharge date must be after encounter start date");
            return false;
          }
        }
        return true;
      case 3:
        if (diagnoses.length === 0) {
          toastError("Please add at least one diagnosis");
          return false;
        }
        return true;
      case 4:
        if (services.length === 0) {
          toastError("Please add at least one service");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Check if next button should be disabled
  const isNextDisabled = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !selectedPatient;
      case 2:
        return (
          !encounterData.emergencyType ||
          !encounterData.arrivalType ||
          !encounterData.attendingClinician ||
          !encounterData.encounterStartDate ||
          !encounterData.dischargeStatus ||
          !encounterData.wardClinic ||
          !encounterData.serviceType
        );
      case 3:
        return diagnoses.length === 0;
      case 4:
        return services.length === 0;
      default:
        return false;
    }
  }, [currentStep, selectedPatient, encounterData, diagnoses, services]);

  // Diagnosis functions
  const handleAddDiagnosis = (diagnosisData: any) => {
    const newDiagnosis = {
      id: `diag-${Date.now()}`,
      type: diagnosisData.type || "ICD10",
      code: diagnosisData.code,
      diagnosis: diagnosisData.diagnosis,
      note: "",
    };
    setDiagnoses([...diagnoses, newDiagnosis]);
    toastSuccess("Diagnosis added");
  };

  const handleRemoveDiagnosis = (id: string) => {
    setDiagnoses(diagnoses.filter((d) => d.id !== id));
    toastSuccess("Diagnosis removed");
  };

  const handleEditNote = (id: string) => {
    const diagnosis = diagnoses.find((d) => d.id === id);
    if (diagnosis) {
      setEditingNoteId(id);
      setNoteInput(diagnosis.note);
    }
  };

  const handleSaveNote = () => {
    if (editingNoteId) {
      setDiagnoses(
        diagnoses.map((d) =>
          d.id === editingNoteId ? { ...d, note: noteInput } : d,
        ),
      );
      setEditingNoteId(null);
      setNoteInput("");
      toastSuccess("Note updated");
    }
  };

  // Service functions
  const handleAddService = (service: ProductItem) => {
    const exists = services.some((s) => s.id === service.id);
    if (!exists) {
      setServices([...services, { ...service, quantity: 1 }]);
      toastSuccess("Service added");
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setServices(services.map((s) => (s.id === id ? { ...s, quantity } : s)));
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
    toastSuccess("Service removed");
  };

// File upload functions with size restriction
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files) return;

  const MAX_FILE_SIZE = 300 * 1024; // 300KB in bytes
  
  const files = Array.from(event.target.files);
  
  // Filter files by size
  const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
  const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
  
  // Show warning for oversized files
  if (oversizedFiles.length > 0) {
    toastError(`${oversizedFiles.length} file(s) exceed the 300KB size limit and were not uploaded`);
  }
  
  // Process valid files
  const newFiles = validFiles.map(file => ({
    file,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
  }));

  if (newFiles.length > 0) {
    setUploadedFiles(prev => [...prev, ...newFiles]);
    event.target.value = "";
    toastSuccess(`${newFiles.length} file(s) uploaded successfully`);
  }
};

const handleRemoveFile = (index: number) => {
  setUploadedFiles(prev => {
    // Clean up the preview URL for images
    if (prev[index].preview) {
      URL.revokeObjectURL(prev[index].preview);
    }
    return prev.filter((_, i) => i !== index);
  });
};

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return services.reduce((sum, service) => {
      const price = service.price ?? 0;
      const quantity = service.quantity ?? 1;
      return sum + price * quantity;
    }, 0);
  }, [services]);

  // Final submission
  const handleFinalSubmit = () => {
    if (!selectedPatient || !selectedProviderId) {
      toastError("Missing required information");
      return;
    }

    const encounterPayload = buildEncounterPayload({
      patientId: selectedPatient.id,
      formState: {
        selectedDepartment: encounterData.wardClinic,
        selectedServiceType: encounterData.serviceType,
        encounterStartDateTime: encounterData.encounterStartDate,
        dischargeStatus: encounterData.dischargeStatus,
        dischargeDate: encounterData.dischargeDate,
        selectedMedicalHistory: encounterData.selectedMedicalHistory,
        attendingPhysician: encounterData.attendingClinician,
      },
      diagnoses: diagnoses.map((d) => ({
        id: d.id,
        type: d.type,
        code: d.code,
        name: d.diagnosis,
        note: d.note,
      })),
      selectedDiagnoses: diagnoses.map((d) => d.id),
      selectedMedicalHistory: encounterData.selectedMedicalHistory,
      productServiceItems: services,
    });

    console.log("Submitting encounter:", encounterPayload);
    dispatch(createEncounter(encounterPayload));
    setShowFinalConfirm(false);
  };

  // Handle successful creation
  useEffect(() => {
    if (encounterSuccess && !encounterLoading && !showSuccess) {
      setCreatedBillId(`EB-${Date.now()}`);
      setShowSuccess(true);
    }
    const timer = setTimeout(() => {
      dispatch(resetEncounterState());
    }, 500);

    return () => clearTimeout(timer);
  }, [encounterSuccess, encounterLoading, showSuccess]);

  // Handle errors
  useEffect(() => {
    if (encounterError) {
      toastError(encounterError.message ?? "An error occurred");
    }
  }, [encounterError, toastError]);

  const handleCreateAnother = () => {
    dispatch(resetEncounterState());
    setShowSuccess(false);
    setCurrentStep(1);
    setSelectedPatient(null);
    setSearchTerm("");
    setEncounterData({
      emergencyType: "",
      arrivalType: "",
      attendingClinician: "",
      encounterStartDate: "",
      encounterEndDate: "",
      dischargeStatus: "",
      dischargeDate: "",
      wardClinic: "",
      serviceType: "",
      selectedMedicalHistory: [],
    });
    setDiagnoses([]);
    setServices([]);
    setUploadedFiles([]);
    setCreatedBillId("");
  };

  const handleGoToBills = () => {
    dispatch(resetEncounterState());
    navigate("/emergency/bills");
  };
  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      dispatch(resetEncounterState());
    };
  }, [dispatch]);

  // 72 hr date logic
  const maxEndDate = useMemo(() => {
    if (!encounterData.encounterStartDate) return "";

    const d = new Date(encounterData.encounterStartDate);
    d.setHours(d.getHours() + 72);

    return d.toISOString().split("T")[0];
  }, [encounterData.encounterStartDate]);

  // clean up for dates
  useEffect(() => {
    const { encounterStartDate, encounterEndDate } = encounterData;

    if (!encounterEndDate || !encounterStartDate) return;

    const start = new Date(encounterStartDate);
    const end = new Date(encounterEndDate);
    const max = new Date(maxEndDate);

    const isBeforeStart = end < start;
    const exceeds72hrs = end > max;

    if (isBeforeStart || exceeds72hrs) {
      setEncounterData((prev) => ({
        ...prev,
        encounterEndDate: "",
      }));
    }
  }, [encounterData.encounterStartDate, maxEndDate]);

  useEffect(() => {
    if (
      encounterData.dischargeDate &&
      encounterData.encounterStartDate &&
      encounterData.dischargeDate < encounterData.encounterStartDate
    ) {
      setEncounterData((prev) => ({
        ...prev,
        dischargeDate: "",
      }));
    }
  }, [encounterData.encounterStartDate]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Patient Identification
              </h2>
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="px-8 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                Create new patient
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name or Number
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search by patient name or number..."
                  className="w-full pl-5 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-900 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                    Found {searchResults.length} patient(s)
                  </div>
                  {searchResults.map((patient: Patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Patient #: {patient.hospitalNumber}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Patient #: {selectedPatient.hospitalNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchTerm("");
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        const emergencyCategories = [
          { id: "road_traffic", name: "Road traffic accidents" },
          { id: "obstetric", name: "Obstetric & gynecologic emergencies" },
          { id: "drug_poisoning", name: "Drug & poising emergencies" },
          { id: "trauma", name: "Trauma and Injuries" },
          { id: "pediatric", name: "Pediatric emergency" },
          { id: "gunshot", name: "Gunshot injuries" },
          { id: "medical", name: "Medical emergencies" },
          { id: "assault", name: "Assault Cases" },
          { id: "snake_bites", name: "Snake bites" },
          { id: "other", name: "Other" },
        ];

        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Emergency Encounter Details
            </h2>

            {/* Row 1: Emergency Type, Arrival Type, Attending Clinician */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Type
                </label>
                <div className="relative">
                  <select
                    value={encounterData.emergencyType}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        emergencyType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500"
                  >
                    <option value="">Select emergency type</option>
                    <option value="trauma">Trauma</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="cardiac">Cardiac Emergency</option>
                    <option value="respiratory">Respiratory Emergency</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2/3 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Type
                </label>
                <div className="relative">
                  <select
                    value={encounterData.arrivalType}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        arrivalType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500"
                  >
                    <option value="">Select arrival type</option>
                    <option value="ambulance">Ambulance</option>
                    <option value="walk-in">Walk-in</option>
                    <option value="referral">Referral</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2/3 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attending Clinician
                </label>
                <input
                  type="text"
                  value={encounterData.attendingClinician}
                  onChange={(e) =>
                    setEncounterData({
                      ...encounterData,
                      attendingClinician: e.target.value,
                    })
                  }
                  placeholder="Enter text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Row 2: Encounter Start Date, Encounter End Date, Discharge Status */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encounter Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={encounterData.encounterStartDate}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        encounterStartDate: e.target.value,
                      })
                    }
                    placeholder="mm/dd/yy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encounter End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={encounterData.encounterEndDate}
                    min={encounterData.encounterStartDate || undefined}
                    max={maxEndDate || undefined}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        encounterEndDate: e.target.value,
                      })
                    }
                    placeholder="mm/dd/yy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discharge Status
                </label>
                <div className="relative">
                  <select
                    value={encounterData.dischargeStatus}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        dischargeStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500"
                  >
                    <option value="">Select status</option>
                    {dischargeTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2/3 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Ward/Clinic, Discharge Date, Service Type */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ward/Clinic
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={encounterData.wardClinic}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        wardClinic: e.target.value,
                      })
                    }
                    placeholder="Search ward..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400"
                    list="ward-options"
                  />
                  <Search className="absolute right-3 top-2/3 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <datalist id="ward-options">
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discharge Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={encounterData.dischargeDate}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        dischargeDate: e.target.value,
                      })
                    }
                    min={encounterData.encounterStartDate || undefined}
                    placeholder="mm/dd/yy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                    disabled={!encounterData.encounterStartDate}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <div className="relative">
                  <select
                    value={encounterData.serviceType}
                    onChange={(e) =>
                      setEncounterData({
                        ...encounterData,
                        serviceType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500"
                  >
                    <option value="">Select service type</option>
                    {serviceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2/3 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Emergency Category Checkboxes */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Emergency Category
              </h3>
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                {emergencyCategories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={encounterData.selectedMedicalHistory.includes(
                        category.id,
                      )}
                      onChange={(e) => {
                        const newHistory = e.target.checked
                          ? [
                              ...encounterData.selectedMedicalHistory,
                              category.id,
                            ]
                          : encounterData.selectedMedicalHistory.filter(
                              (id) => id !== category.id,
                            );
                        setEncounterData({
                          ...encounterData,
                          selectedMedicalHistory: newHistory,
                        });
                      }}
                      className="w-5 h-5 text-[#3B7A6F] border-2 border-[#3B7A6F] rounded focus:ring-[#3B7A6F] bg-white"
                    />
                    <span className="text-sm text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Diagnosis</h2>
              <button
                onClick={() => setShowDiagnosisSearch(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#DC2626]  text-[#DC2626]  rounded-sm hover:bg-red-200 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Diagnosis
              </button>
            </div>

            {/* show diagnosis search when the add diagnosis button is clicked */}
            {showDiagnosisSearch && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <ICDSearch
                  onSelect={(diagnosis) => {
                    handleAddDiagnosis({
                      type: diagnosis.type || "ICD10",
                      code: diagnosis.code,
                      diagnosis: diagnosis.name,
                    });
                    setShowDiagnosisSearch(false);
                  }}
                />
              </div>
            )}

            {/* Diagnosis Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#E4F7F078]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Diagnosis
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Note
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No diagnosis added yet. Add a diagnosis to continue.
                      </td>
                    </tr>
                  ) : (
                    diagnoses.map((diagnosis) => (
                      <tr
                        key={diagnosis.id}
                        className="border-t border-gray-200"
                      >
                        <td className="px-4 py-3 text-sm">{diagnosis.type}</td>
                        <td className="px-4 py-3 text-sm">{diagnosis.code}</td>
                        <td className="px-4 py-3 text-sm">
                          {diagnosis.diagnosis}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {editingNoteId === diagnosis.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Enter note..."
                              />
                              <button
                                onClick={handleSaveNote}
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <span>{diagnosis.note || "Enter note..."}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditNote(diagnosis.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveDiagnosis(diagnosis.id)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Product/Service
              </h2>
              <button
                onClick={() => setShowProductSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-sm hover:bg-red-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Product/Service
              </button>
            </div>

            {/* show product search when the add service button is clicked */}
            {showProductSearch && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <ProductServiceSearch onSelect={handleAddService} />
              </div>
            )}

            {/* Services Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#E4F7F078]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tariff Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      NHIS Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      NHIS(%)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No services added yet. Add a service to continue.
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => {
                      const price = service.price ?? 0;
                      const quantity = service.quantity ?? 1;
                      const total = price * quantity;
                      return (
                        <tr
                          key={service.id}
                          className="border-t border-gray-200"
                        >
                          <td className="px-4 py-3 text-sm">
                            {service.code || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">{service.name}</td>

                          <td className="px-4 py-3 text-sm">
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  service.id,
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-20 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {service.nhisPrice}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {service.nhisPercentage}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            ₦{total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemoveService(service.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Upload Supporting Document */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Upload Supporting Document
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop to upload a passport photo
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    or{" "}
                    <label className="text-[#DC2626] cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                      />
                    </label>{" "}
                    to select a PNG file or JPEG
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Uploaded Documents
                </h3>
                <div className="grid grid-cols-2 gap-4">
  {uploadedFiles.length === 0 ? (
    <p className="text-sm text-gray-500">No documents uploaded</p>
  ) : (
    uploadedFiles.map((item, index) => {
      const isImage = item.file.type.startsWith("image/");
      const isPdf = item.file.type === "application/pdf";

      return (
        <div
          key={index}
          className="relative border rounded-lg overflow-hidden group"
        >
          {/* preview */}
          {isImage ? (
            <img
              src={item.preview}
              alt={item.file.name}
              className="w-full h-40 object-cover"
            />
          ) : isPdf ? (
            <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-600 text-sm">
              PDF Document
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-600 text-sm">
              File
            </div>
          )}

          {/* overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              onClick={() => handleRemoveFile(index)}
              className="bg-white p-2 rounded-full shadow hover:bg-red-50"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>

          {/* filename */}
          <div className="p-2 text-xs truncate">{item.file.name}</div>
        </div>
      );
    })
  )}
</div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Bill Summary</h2>

            {/* Patient Details */}
            {selectedPatient && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedPatient.firstName[0]}
                      {selectedPatient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPatient.hospitalNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Patient Number:
                    </span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.hospitalNumber}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gender:</span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.gender || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.address || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Phone number:
                    </span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.phoneNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Insurance:
                    </span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.insuranceStatus || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">D.O.B:</span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.dateOfBirth
                        ? new Date(
                            selectedPatient.dateOfBirth,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Hospital Number:
                    </span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.hospitalNumber}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    <span className="text-gray-900">
                      {selectedPatient.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Diagnosis List
              </h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Diagnosis
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm">{diagnosis.type}</td>
                      <td className="px-4 py-2 text-sm">{diagnosis.code}</td>
                      <td className="px-4 py-2 text-sm">
                        {diagnosis.diagnosis}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {diagnosis.note || "Enter note..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Uploaded Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {file.file.name}
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Services
              </h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Tariff Code
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => {
                    const price = service.price ?? 0;
                    const quantity = service.quantity ?? 1;
                    const total = price * quantity;
                    return (
                      <tr key={service.id} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-sm">
                          {service.code || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">{service.name}</td>
                        <td className="px-4 py-2 text-sm">{quantity}</td>
                        <td className="px-4 py-2 text-sm">
                          ₦{price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ₦{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-2xl font-bold text-[#10B981]">
                    ₦{totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm px-8 py-10">
          <h1 className="text-2xl font-semibold text-gray-700 border-b-2  border-gray-200 pb-4 mb-8 ">
            Create New Bill
          </h1>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={5} />

          {/* Step Content */}
          <div className="mt-10 max-w">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex  items-center max-w-4xl">
            {currentStep < 5 ? (
              <button
                onClick={goToNextStep}
                disabled={isNextDisabled()}
                className={`px-8 py-2.5 rounded-sm font-normal transition-colors w-50 ${
                  isNextDisabled()
                    ? "bg-red-200 text-red-400 cursor-not-allowed"
                    : "bg-[#DC2626] text-white hover:bg-red-700"
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowFinalConfirm(true)}
                disabled={encounterLoading}
                className={`px-8 py-2.5 rounded-sm font-normal transition-colors w-50  ${
                  encounterLoading
                    ? "bg-red-200 text-red-400 cursor-not-allowed"
                    : "bg-[#DC2626] text-white hover:bg-red-700"
                }`}
              >
                {encounterLoading ? "Submitting..." : "Submit"}
              </button>
            )}

            {currentStep > 1 ? (
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-2 px-6 py-2.5  text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/emergency/bills")}
                  className="px-8 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Patient Form Modal */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientRegistered={handlePatientRegistered}
      />

      {/* Patient Confirmation Modal */}
      <ConfirmModal
        isOpen={showPatientConfirm}
        onClose={() => setShowPatientConfirm(false)}
        onConfirm={confirmPatientSelection}
        title="Confirm Patient Selection"
        message={
          selectedPatient
            ? `You are about to create an emergency bill for:
            
            • Patient: ${selectedPatient.firstName} ${selectedPatient.lastName}
            • Patient Number: ${selectedPatient.hospitalNumber}
            • Insurance: ${selectedPatient.insuranceStatus || "N/A"}
            
            Please confirm to proceed.`
            : ""
        }
        confirmText="Confirm Patient"
        cancelText="Cancel"
        type="info"
      />

      {/* Final Confirmation Modal */}
      <ConfirmModal
        isOpen={showFinalConfirm}
        onClose={() => setShowFinalConfirm(false)}
        onConfirm={handleFinalSubmit}
        title="Confirm Emergency Bill Submission"
        message={`Are you sure you want to submit this emergency bill?

        • Patient: ${selectedPatient?.firstName} ${selectedPatient?.lastName}
        • Total Services: ${services.length}
        • Total Diagnosis: ${diagnoses.length}
        • Total Amount: ₦${totalAmount.toFixed(2)}
        
        This action cannot be undone.`}
        confirmText="Submit Bill"
        cancelText="Cancel"
        type="warning"
        isLoading={encounterLoading}
      />

      {/* Success Modal */}
      <BillSuccessModal
        isOpen={showSuccess}
        onCreateAnother={handleCreateAnother}
        onGoToBills={handleGoToBills}
        billDetails={
          selectedPatient
            ? {
                billId: createdBillId,
                patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                patientNumber: selectedPatient.hospitalNumber,
                totalAmount: totalAmount,
                servicesCount: services.length,
                diagnosisCount: diagnoses.length,
                encounterId: `ENC-${Date.now()}`,
              }
            : undefined
        }
      />
    </div>
  );
}
