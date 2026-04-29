import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import { useProviderContext } from "../../../context/useProviderContext";
import { registerPatient } from "../../../services/thunks/patientThunk";
import { clearPatientState } from "../../../services/slices/patientSlice";
import type { AppDispatch, RootState } from "../../../services/store/store";
import Input from "../../../components/form/Input";
import FormSelect from "../../../components/form/FormSelect";
import { insuranceTypeOptions } from "../../../utils/insuranceTypeUtils";
import { genderTypeOptions } from "../../../utils/genderType";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import PatientSearch from "../../../components/ui/PatientSearch";
import { enforceDigits } from "../../../utils/enforceDigits";

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

interface PatientFormProps {
  onPatientRegistered?: (patientId: string) => void;
  existingPatient?: any;
  onAttachToPatient?: (patientId: string) => void;
  availablePatients?: any[];
}

export default function PatientForm({
  onPatientRegistered,
  existingPatient,
  onAttachToPatient,
  availablePatients = [],
}: PatientFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProviderId } = useProviderContext();
  const { loading, success, error, registeredPatientId } = useSelector(
    (state: RootState) => state.patient,
  );

  const [mode, setMode] = useState<"search" | "new" | "existing">(
    existingPatient ? "existing" : "search",
  );
  const [selectedPatient, setSelectedPatient] = useState<any>(
    existingPatient || null,
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isFormValid, setIsFormValid] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_confirmationType, setConfirmationType] = useState<
    "register" | "attach"
  >("register");

  const [formData, setFormData] = useState<FormData>(
    existingPatient
      ? {
          hospitalNumber: existingPatient.hospitalNumber || "",
          firstName: existingPatient.firstName || "",
          lastName: existingPatient.lastName || "",
          insuranceStatus: existingPatient.insuranceStatus || "",
          dateOfBirth: existingPatient.dateOfBirth
            ? new Date(existingPatient.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: existingPatient.gender || "",
          address: existingPatient.address || "",
          email: existingPatient.email || "",
          phoneNumber: existingPatient.phoneNumber || "",
        }
      : {
          hospitalNumber: "",
          firstName: "",
          lastName: "",
          insuranceStatus: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          email: "",
          phoneNumber: "",
        },
  );

  // Handle patient selection from search
  const handlePatientSelect = (_patientId: string, patientData: any) => {
    setSelectedPatient(patientData);
    setMode("existing");
    setFormData({
      hospitalNumber: patientData.hospitalNumber || "",
      firstName: patientData.firstName || "",
      lastName: patientData.lastName || "",
      insuranceStatus: patientData.insuranceStatus || "",
      dateOfBirth: patientData.dateOfBirth
        ? new Date(patientData.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: patientData.gender || "",
      address: patientData.address || "",
      email: patientData.email || "",
      phoneNumber: patientData.phoneNumber || "",
    });
  };

  const handleNewPatient = () => {
    setMode("new");
    setSelectedPatient(null);
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
  };

  // const handleInputChange = (field: keyof FormData, value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let newValue = value;

    if (field === "phoneNumber") {
      newValue = enforceDigits(value, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form before showing confirmation
  const validateForm = () => {
    if (mode === "existing") {
      // For existing patients, we just need a provider
      setIsFormValid(Boolean(selectedProviderId));
      return Boolean(selectedProviderId);
    }

    // For new patients, validate all required fields
    const requiredFields: (keyof FormData)[] = [
      "hospitalNumber",
      "firstName",
      "lastName",
      "insuranceStatus",
      "dateOfBirth",
      "gender",
      "address",
      // "email",
      "phoneNumber",
    ];

    const isValid = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== "",
    );

    setIsFormValid(isValid && Boolean(selectedProviderId));
    return isValid && Boolean(selectedProviderId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProviderId) {
      alert("Please select a provider first");
      return;
    }

    // Validate form
    if (!validateForm()) {
      if (mode === "new") {
        alert("Please fill in all required fields");
      }
      return;
    }

    // Set confirmation type based on mode
    setConfirmationType(mode === "existing" ? "attach" : "register");

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  // This is the actual submission function that gets called after confirmation
  // In PatientForm.tsx - Fix the submitPatientData function
  const submitPatientData = () => {
    if (!selectedProviderId) {
      return;
    }

    // If existing patient, attach emergency bill directly
    if (mode === "existing" && selectedPatient) {
      if (onAttachToPatient) {
        onAttachToPatient(selectedPatient.id);
      }
      setShowConfirmModal(false);
      return;
    }

    // Otherwise register new patient
    // Calculate age from date of birth
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
      // Add the required properties with default values
      id: "", // Will be generated by backend
      isActive: true,
      createdDate: new Date().toISOString(),
      age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0,
    };

    console.log("Sending patient data:", patientData);
    dispatch(registerPatient(patientData));
    setShowConfirmModal(false);
  };

  // Get confirmation message based on mode
  const getConfirmationMessage = () => {
    if (mode === "existing") {
      return `Attach emergency bill to existing patient:
      
      • Patient: ${formData.firstName} ${formData.lastName}
      • Hospital Number: ${formData.hospitalNumber}
      • Insurance: ${formData.insuranceStatus}
      • Phone: ${formData.phoneNumber}
      
      This patient's information will be used for the emergency bill.
      Confirm to proceed with emergency bill entry.`;
    }

    return `Please ensure all patient information is correct. Once submitted, this information cannot be edited or corrected. Double-check the following:
    
    • Hospital Number: ${formData.hospitalNumber}
    • Patient Name: ${formData.firstName} ${formData.lastName}
    • Date of Birth: ${formData.dateOfBirth}
    • Insurance Status: ${formData.insuranceStatus}
    • Contact Information: ${formData.phoneNumber}, ${formData.email}
    
    Are you sure you want to proceed with this registration?`;
  };

  const getConfirmationTitle = () => {
    return mode === "existing"
      ? "Attach Emergency Bill to Existing Patient"
      : "Confirm Patient Registration";
  };

  const getConfirmationButtonText = () => {
    return mode === "existing" ? "Yes, Attach Bill" : "Yes, Register Patient";
  };

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPatientState());
    };
  }, [dispatch]);

  // Handle successful registration and navigate to next tab
  useEffect(() => {
    if (success && registeredPatientId && onPatientRegistered) {
      // Reset form
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
      setMode("search");

      const timer = setTimeout(() => {
        onPatientRegistered(registeredPatientId);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success, registeredPatientId, onPatientRegistered, dispatch]);

  // If we're attaching to an existing patient, call onAttachToPatient when mode changes
  useEffect(() => {
    if (
      mode === "existing" &&
      selectedPatient &&
      onAttachToPatient &&
      !showConfirmModal
    ) {
      // Note: We'll handle this in submitPatientData after confirmation
    }
  }, [mode, selectedPatient, onAttachToPatient, showConfirmModal]);

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitPatientData}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        confirmText={getConfirmationButtonText()}
        cancelText="Cancel"
        type="warning"
        isLoading={loading}
      />

      <div className="max-w-3xl mx-auto p-6">
        {/* Patient Search Section */}
        {mode === "search" && (
          <div className="mb-8 p-6 border rounded-lg bg-gray-50">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Find Patient
              </h2>
              <p className="text-gray-600 mt-1">
                Search for existing patient or register a new one
              </p>
            </div>
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              onNewPatient={handleNewPatient}
              availablePatients={availablePatients}
            />
          </div>
        )}

        {/* Patient Information Section */}
        {(mode === "new" || mode === "existing") && (
          <>
            {/* Header with mode indicator and back button */}
            <div className="mb-6 p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {mode === "existing"
                      ? "Existing Patient"
                      : "New Patient Registration"}
                  </h2>
                  {mode === "existing" && selectedPatient && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Existing Patient Record
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {selectedPatient.id}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setMode("search");
                    setSelectedPatient(null);
                  }}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  ← Back to Search
                </button>
              </div>
            </div>

            {/* Display error/success messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Patient registered successfully! Redirecting to Emergency
                Bill...
              </div>
            )}

            {/* Patient Form */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 mt-2"
            >
              <div className="flex flex-col">
                <label className="font-medium mb-1">Patient Number</label>
                <Input
                  type="text"
                  value={formData.hospitalNumber}
                  onChange={(e) =>
                    handleInputChange("hospitalNumber", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  label="Patient Number"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">First Name</label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  label="First Name"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Last Name</label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  label="Last Name"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Insurance Status</label>
                <FormSelect
                  label="Insurance Status"
                  value={formData.insuranceStatus}
                  onChange={(e) =>
                    handleSelectChange("insuranceStatus", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                >
                  <option value="">Select Insurance Status</option>
                  {insuranceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  className="border rounded-xl p-2 disabled:bg-gray-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Gender</label>
                <FormSelect
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleSelectChange("gender", e.target.value)}
                  required={mode === "new"}
                  disabled={mode === "existing"}
                >
                  <option value="">Select Gender</option>
                  {genderTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Address</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  label="Address"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  // required={mode === 'new'}
                  disabled={mode === "existing"}
                  label="Email"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Phone Number</label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  required={mode === "new"}
                  disabled={mode === "existing"}
                  label="Phone Number"
                />
              </div>

              <div className="flex flex-col py-6 col-span-2">
                <button
                  type="submit"
                  disabled={loading || !selectedProviderId}
                  className={`w-full justify-center flex items-center gap-2 ${
                    loading || !selectedProviderId
                      ? "bg-gray-400 cursor-not-allowed"
                      : mode === "existing"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-[#DC2626] hover:bg-red-700 text-white"
                  } rounded-md p-3 transition-colors font-medium`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : mode === "existing" ? (
                    <>
                      <ArrowRight size={24} />
                      Attach Emergency Bill
                    </>
                  ) : (
                    <>
                      <ArrowRight size={24} />
                      Register Patient
                    </>
                  )}
                </button>

                {!selectedProviderId && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    Please select a provider before proceeding
                  </p>
                )}

                {mode === "existing" && (
                  <p className="text-gray-500 text-sm mt-2 text-center">
                    Attaching emergency bill to existing patient record
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
