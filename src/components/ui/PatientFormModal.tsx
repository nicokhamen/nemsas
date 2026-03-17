import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, X, ChevronDown } from "lucide-react";
import { useProviderContext } from "../../context/useProviderContext";
import { registerPatient } from "../../services/thunks/patientThunk";
import { clearPatientState } from "../../services/slices/patientSlice";
import type { AppDispatch, RootState } from "../../services/store/store";
import { insuranceTypeOptions } from "../../utils/insuranceTypeUtils";
import { genderTypeOptions } from "../../utils/genderType";
import PatientConfirmModal from "./PatientConfirmModal";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientRegistered?: (patientId: string, patientData?: any) => void;
}

interface FormData {
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onPatientRegistered,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProviderId } = useProviderContext();
  const { loading, success, error, registeredPatientId, patientData } =
    useSelector((state: RootState) => state.patient);

  const [formData, setFormData] = useState<FormData>({
    hospitalNumber: "",
    firstName: "",
    lastName: "",
    insuranceStatus: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    email: "",
    phoneNumber: "",
  });

  const [touchedFields, setTouchedFields] = useState<Set<keyof FormData>>(
    new Set(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        hospitalNumber: "",
        firstName: "",
        lastName: "",
        insuranceStatus: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        email: "",
        phoneNumber: "",
      });
      setTouchedFields(new Set());
      setShowSuccess(false);
      setHasNotified(false);
      dispatch(clearPatientState());
    }
  }, [isOpen, dispatch]);

  // Handle successful registration
  // In PatientFormModal.tsx - Fix the useEffect for successful registration
  useEffect(() => {
    // Only proceed if we haven't shown success yet and have the required data
    if (success && registeredPatientId && !showSuccess && !hasNotified) {
      setShowSuccess(true);
      setHasNotified(true);

      // Get the full patient data from the response
      const patientDataWithAge = patientData || {
        id: registeredPatientId,
        ...formData,
        age: calculateAge(formData.dateOfBirth),
      };

      console.log(
        "PatientFormModal - Sending patient data:",
        patientDataWithAge,
      );

      // Notify parent with patient data
      if (onPatientRegistered) {
        onPatientRegistered(registeredPatientId, patientDataWithAge);
      }

      // Close modal after a short delay
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [
    success,
    registeredPatientId,
    patientData,
    showSuccess,
    hasNotified,
    formData,
    onPatientRegistered,
    onClose,
  ]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const isFieldValid = (field: keyof FormData): boolean => {
    if (field === "email") return true; // Email is optional
    return Boolean(formData[field] && formData[field].trim() !== "");
  };

  const isFormValid = (): boolean => {
    const requiredFields: (keyof FormData)[] = [
      "hospitalNumber",
      "firstName",
      "lastName",
      "insuranceStatus",
      "dateOfBirth",
      "gender",
      "address",
      "phoneNumber",
    ];

    return (
      requiredFields.every((field) => isFieldValid(field)) &&
      Boolean(selectedProviderId)
    );
  };

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedProviderId) {
    alert("Please select a provider first");
    return;
  }

  if (!isFormValid()) {
    // Mark all fields as touched to show validation errors
    const allFields: (keyof FormData)[] = [
      "hospitalNumber",
      "firstName",
      "lastName",
      "insuranceStatus",
      "dateOfBirth",
      "gender",
      "address",
      "phoneNumber",
    ];
    setTouchedFields(new Set(allFields));
    return;
  }

  // Show confirmation modal instead of submitting directly
  setShowConfirmModal(true);
};

const handleConfirmRegistration = () => {
  // Add a type guard to ensure selectedProviderId is not null
  if (!selectedProviderId) {
    alert("Provider selection lost. Please try again.");
    setShowConfirmModal(false);
    return;
  }

  const patientData = {
    providerId: selectedProviderId, // Now TypeScript knows this is string
    hospitalNumber: formData.hospitalNumber,
    firstName: formData.firstName,
    lastName: formData.lastName,
    insuranceStatus: formData.insuranceStatus,
    dateOfBirth: formData.dateOfBirth
      ? new Date(formData.dateOfBirth).toISOString()
      : "",
    gender: formData.gender,
    address: formData.address,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    id: "",
    isActive: true,
    createdDate: new Date().toISOString(),
    age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0,
  };

  dispatch(registerPatient(patientData));
  setShowConfirmModal(false);
};

  const getFieldError = (field: keyof FormData): string | undefined => {
    if (!touchedFields.has(field)) return undefined;
    if (field === "email") return undefined; // Email is optional
    if (!formData[field] || formData[field].trim() === "") {
      return `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
    }
    return undefined;
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
              <div>
                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                  Register New Patient
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter patient information to create a new record
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 bg-white">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">
                    ✓ Patient registered successfully! Proceeding to emergency
                    bill...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Patient Number, First Name */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.hospitalNumber}
                      onChange={(e) =>
                        handleInputChange("hospitalNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("hospitalNumber")}
                      placeholder="Enter patient number"
                      disabled={loading || showSuccess}
                      className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("hospitalNumber") ? "border-red-500" : "border-gray-300"}`}
                    />
                    {getFieldError("hospitalNumber") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("hospitalNumber")}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          "firstName",
                          e.target.value.replace(/[^a-zA-Z\s'-]/g, ""),
                        )
                      }
                      onBlur={() => handleBlur("firstName")}
                      placeholder="Enter first name"
                      disabled={loading || showSuccess}
                      className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("firstName") ? "border-red-500" : "border-gray-300"}`}
                    />
                    {getFieldError("firstName") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("firstName")}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Last Name, Insurance Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          "lastName",
                          e.target.value.replace(/[^a-zA-Z\s'-]/g, ""),
                        )
                      }
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Enter last name"
                      disabled={loading || showSuccess}
                      className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("lastName") ? "border-red-500" : "border-gray-300"}`}
                    />
                    {getFieldError("lastName") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("lastName")}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.insuranceStatus}
                        onChange={(e) =>
                          handleInputChange("insuranceStatus", e.target.value)
                        }
                        onBlur={() => handleBlur("insuranceStatus")}
                        disabled={loading || showSuccess}
                        className={`w-full px-4 py-3 border rounded-sm bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("insuranceStatus") ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select Insurance Status</option>
                        {insuranceTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-0 bottom-0 my-auto h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {getFieldError("insuranceStatus") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("insuranceStatus")}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Date of Birth, Gender */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      onBlur={() => handleBlur("dateOfBirth")}
                      disabled={loading || showSuccess}
                      className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("dateOfBirth") ? "border-red-500" : "border-gray-300"}`}
                    />
                    {getFieldError("dateOfBirth") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("dateOfBirth")}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        onBlur={() => handleBlur("gender")}
                        disabled={loading || showSuccess}
                        className={`w-full px-4 py-3 border rounded-sm bg-white appearance-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none text-gray-500 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("gender") ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select Gender</option>
                        {genderTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-0 bottom-0 my-auto h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {getFieldError("gender") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("gender")}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Email, Phone Number */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      disabled={loading || showSuccess}
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder="Enter phone number"
                      disabled={loading || showSuccess}
                      className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("phoneNumber") ? "border-red-500" : "border-gray-300"}`}
                    />
                    {getFieldError("phoneNumber") && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError("phoneNumber")}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: Address (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    onBlur={() => handleBlur("address")}
                    placeholder="Enter full address"
                    disabled={loading || showSuccess}
                    className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${getFieldError("address") ? "border-red-500" : "border-gray-300"}`}
                  />
                  {getFieldError("address") && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError("address")}</p>
                  )}
                </div>

                {/* Provider Selection Warning */}
                {!selectedProviderId && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <p className="text-sm text-yellow-700">
                      Please select a provider before registering a patient
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedProviderId || showSuccess}
                    className={`inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white rounded-sm shadow-sm ${
                      loading || !selectedProviderId || showSuccess
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Register Patient
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
    </div>
     </> 
 

  );
  return (
  <>
    {ReactDOM.createPortal(modalContent, document.body)}
    {/* Render PatientConfirmModal in its own portal */}
    <PatientConfirmModal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      onConfirm={handleConfirmRegistration}
      patientData={formData}
      isLoading={loading}
    />
  </>
);

  return ReactDOM.createPortal(modalContent, document.body);

  
};

export default PatientFormModal;
