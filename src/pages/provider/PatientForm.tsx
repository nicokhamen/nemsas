import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import { useProviderContext } from "../../context/useProviderContext";
import { registerPatient } from "../../services/thunks/patientThunk";
import { clearPatientState } from "../../services/slices/patientSlice";
import type { AppDispatch, RootState } from "../../services/store/store";
import Input from "../../components/form/Input";
import FormSelect from "../../components/form/FormSelect";
import { insuranceTypeOptions } from "../../utils/insuranceTypeUtils";
import { genderTypeOptions } from "../../utils/genderType";
import ConfirmModal from "../../components/ui/ConfirmModal";


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
  onPatientRegistered?: () => void;
}

export default function PatientForm({ onPatientRegistered }: PatientFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProviderId } = useProviderContext();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.patient
  );

  const [formData, setFormData] = React.useState<FormData>({
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

  // State for confirm modal
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [isFormValid, setIsFormValid] = React.useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    const requiredFields: (keyof FormData)[] = [
      "hospitalNumber",
      "firstName",
      "lastName",
      "insuranceStatus",
      "dateOfBirth",
      "gender",
      "address",
      "email",
      "phoneNumber",
    ];

    const isValid = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== ""
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
      alert("Please fill in all required fields");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  // This is the actual submission function that gets called after confirmation
  const submitPatientData = () => {
    if (!selectedProviderId || !isFormValid) {
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
    };

    console.log("Sending patient data:", patientData);
    dispatch(registerPatient(patientData));
    
    // Close modal after submission
    setShowConfirmModal(false);
  };

  // Clear state when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearPatientState());
    };
  }, [dispatch]);

  // Handle successful registration and navigate to next tab
  React.useEffect(() => {
    if (success && onPatientRegistered) {
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

      const timer = setTimeout(() => {
        onPatientRegistered();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success, onPatientRegistered]);

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitPatientData}
        title="Confirm Patient Registration"
        message="Please ensure all patient information is correct. Once submitted, this information cannot be edited or corrected. Double-check the following:
        
        • Hospital Number
        • Patient Name
        • Date of Birth
        • Insurance Status
        • Contact Information
        
        Are you sure you want to proceed with this registration?"
        confirmText="Yes, Register Patient"
        cancelText="No, Go Back"
        type="warning"
        isLoading={loading}
      />

      <div className="max-w-3xl mx-auto p-6">
        {/* Display error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Display success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Patient registered successfully! Redirecting to Emergency Bill
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col">
            <label className="font-medium mb-1">Patient Number</label>
            <Input
              type="text"
              value={formData.hospitalNumber}
              onChange={(e) =>
                handleInputChange("hospitalNumber", e.target.value)
              }
              required
              label="Patient Number"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">First Name</label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
              label="First Name"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Last Name</label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
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
              required
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
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
              className="border rounded-xl p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Gender</label>
            <FormSelect
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleSelectChange("gender", e.target.value)}
              required
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
              required
              label="Address"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              label="Email"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Phone Number</label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              required
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
                  : "text-[#DC2626] hover:bg-red-50"
              } rounded-md p-2 transition-colors`}
            >
              {loading ? (
                "Registering..."
              ) : (
                <>
                  <ArrowRight size={24} />
                  Register Patient
                </>
              )}
            </button>

            {!selectedProviderId && (
              <p className="text-red-500 text-sm mt-2 text-center">
                Please select a provider before registering a patient
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}