import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, X } from "lucide-react";
import { useProviderContext } from "../../context/useProviderContext";
import { registerPatient } from "../../services/thunks/patientThunk";
import { clearPatientState } from "../../services/slices/patientSlice";
import type { AppDispatch, RootState } from "../../services/store/store";
import Input from "../../components/form/Input";
import FormSelect from "../../components/form/FormSelect";
import { insuranceTypeOptions } from "../../utils/insuranceTypeUtils";
import { genderTypeOptions } from "../../utils/genderType";

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

    const patientData = {
      providerId: selectedProviderId,
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hospital Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.hospitalNumber}
                      onChange={(e) =>
                        handleInputChange("hospitalNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("hospitalNumber")}
                      error={getFieldError("hospitalNumber")}
                      placeholder="Enter patient number"
                      disabled={loading || showSuccess}
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          "firstName",
                          e.target.value.replace(/[^a-zA-Z\s'-]/g, ""),
                        )
                      }
                      onBlur={() => handleBlur("firstName")}
                      error={getFieldError("firstName")}
                      placeholder="Enter first name"
                      disabled={loading || showSuccess}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          "lastName",
                          e.target.value.replace(/[^a-zA-Z\s'-]/g, ""),
                        )
                      }
                      onBlur={() => handleBlur("lastName")}
                      error={getFieldError("lastName")}
                      placeholder="Enter last name"
                      disabled={loading || showSuccess}
                    />
                  </div>

                  {/* Insurance Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Status <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      label=""
                      value={formData.insuranceStatus}
                      onChange={(e) =>
                        handleInputChange("insuranceStatus", e.target.value)
                      }
                      onBlur={() => handleBlur("insuranceStatus")}
                      error={getFieldError("insuranceStatus")}
                      disabled={loading || showSuccess}
                    >
                      <option value="">Select Insurance Status</option>
                      {insuranceTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      onBlur={() => handleBlur("dateOfBirth")}
                      className={`w-full rounded-lg border ${
                        getFieldError("dateOfBirth")
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-red-500 focus:ring-red-500"
                      } px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:text-gray-500`}
                      disabled={loading || showSuccess}
                    />
                    {getFieldError("dateOfBirth") && (
                      <p className="mt-1 text-xs text-red-600">
                        {getFieldError("dateOfBirth")}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      label=""
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      onBlur={() => handleBlur("gender")}
                      error={getFieldError("gender")}
                      disabled={loading || showSuccess}
                    >
                      <option value="">Select Gender</option>
                      {genderTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      onBlur={() => handleBlur("address")}
                      error={getFieldError("address")}
                      placeholder="Enter full address"
                      disabled={loading || showSuccess}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      disabled={loading || showSuccess}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("phoneNumber")}
                      error={getFieldError("phoneNumber")}
                      placeholder="Enter phone number"
                      disabled={loading || showSuccess}
                    />
                  </div>
                </div>

                {/* Provider Selection Warning */}
                {!selectedProviderId && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠ Please select a provider before registering a patient
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedProviderId || showSuccess}
                    className={`inline-flex items-center px-6 py-2 text-sm font-semibold text-white rounded-md shadow-sm ${
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
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PatientFormModal;
