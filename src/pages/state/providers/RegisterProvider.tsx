import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Plus, X, Trash2 } from "lucide-react";
import Input from "../../../components/form/Input";
import FormSelect from "../../../components/form/FormSelect";
import { providerTypeOptions } from "../../../utils/providerType";
import { ownershipTypeOptions } from "../../../utils/ownershipType";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import type { CreateProviderPayload } from "../../../types/stateProvider";
import { createProvider } from "../../../services/thunks/stateProviderThunk";
import { fetchStates } from "../../../services/thunks/fetchStatesThunk";
import { accountTypeOptions } from "../../../utils/accountTypeUtils";
import ProviderConfirmModal from "../../../components/ui/ProviderConfirmModal";
import BankSelect from "../../../components/ui/BankSelect";
import { enforceDigits } from "../../../utils/enforceDigits";
import NhiaApprovedSelect from "../../../components/ui/NhiaApprovedSelect";
import { useCustomToast } from "../../../hooks/useCustomToast";
import ProviderSuccessModal from "../../../components/ui/ProviderSuccessModal";

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
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  isCompleted
                    ? "bg-[#DC2626] text-white"
                    : "bg-gray-400 text-white"
                } ${isCurrent ? "ring-2 ring-[#DC2626] ring-offset-2" : ""}`}
              >
                {isCompleted && step !== currentStep ? (
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
                ) : (
                  <span className="text-sm">{step}</span>
                )}
              </div>

              <span
                className={`text-lg font-medium ${
                  isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Step {step}
              </span>
            </div>

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

interface FormErrors {
  [key: string]: string;
}

interface Contact {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
}

const RegisterProvider: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useCustomToast();
  const { loading, error } = useAppSelector((state) => state.createProvider);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { data: states, loading: statesLoading } = useAppSelector(
    (state) => state.allStates,
  );

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        hmoId: user.hmoId || "",
      }));
    }
  }, [user]);

  // Form state
  const [formData, setFormData] = useState<CreateProviderPayload>({
    hospitalName: "",
    code: "",
    email: "",
    hospitalAdress: "",
    phoneNumber: "",
    bankName: "",
    accountNumber: "",
    bankCode: "",
    accountName: "",
    accountType: "",
    bankVeririfationNumber: "",
    stateLicenseNumber: "",
    licenseExpiryDate: "",
    geoLocation: "",
    stateId: "",
    hmoId: user?.hmoId || "",
    organizationId: "e53bf4dc-162f-41e0-8528-6a0553dad5e3",
    ownership: "",
    providerType: "",
    contacts: [
      {
        name: "",
        designation: "",
        email: "",
        phoneNumber: "",
      },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "phoneNumber" || name === "bankVeririfationNumber") {
      newValue = enforceDigits(value, 11);
    }

    if (name === "accountNumber") {
      newValue = enforceDigits(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle contact changes
  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [name]: value,
    };
    setFormData((prev) => ({
      ...prev,
      contacts: updatedContacts,
    }));
  };

  // Add new contact
  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: "",
          designation: "",
          email: "",
          phoneNumber: "",
        },
      ],
    }));
  };

  // Remove contact
  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        contacts: prev.contacts.filter((_, i) => i !== index),
      }));
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.hospitalName) {
          toastError("Please select a hospital");
          return false;
        }
        if (!formData.email) {
          toastError("Email is required");
          return false;
        }
        if (!formData.geoLocation) {
          toastError("Location is required");
          return false;
        }
        if (!formData.providerType) {
          toastError("Provider type is required");
          return false;
        }
        if (!formData.ownership) {
          toastError("Ownership type is required");
          return false;
        }
        return true;

      case 2:
        if (!formData.stateLicenseNumber) {
          toastError("License number is required");
          return false;
        }
        if (!formData.hospitalAdress) {
          toastError("Hospital address is required");
          return false;
        }
        if (!formData.phoneNumber) {
          toastError("Phone number is required");
          return false;
        }
        if (formData.phoneNumber && formData.phoneNumber.length !== 11) {
          toastError("Phone number must be exactly 11 digits");
          return false;
        }
        if (!formData.stateId) {
          toastError("Please select a state");
          return false;
        }
        if (!formData.licenseExpiryDate) {
          toastError("License expiry date is required");
          return false;
        }
        return true;

      case 3:
        if (!formData.bankName) {
          toastError("Bank name is required");
          return false;
        }
        if (!formData.bankCode) {
          toastError("Bank code is required");
          return false;
        }
        if (!formData.accountName) {
          toastError("Account name is required");
          return false;
        }
        if (!formData.accountNumber) {
          toastError("Account number is required");
          return false;
        }
        if (formData.accountNumber && formData.accountNumber.length !== 10) {
          toastError("Account number must be exactly 10 digits");
          return false;
        }
        if (!formData.accountType) {
          toastError("Account type is required");
          return false;
        }
        if (formData.bankVeririfationNumber && 
            formData.bankVeririfationNumber.length !== 11) {
          toastError("BVN must be exactly 11 digits");
          return false;
        }
        // Validate contacts
        for (let i = 0; i < formData.contacts.length; i++) {
          const contact = formData.contacts[i];
          if (!contact.name) {
            toastError(`Contact name is required for contact ${i + 1}`);
            return false;
          }
          if (!contact.designation) {
            toastError(`Designation is required for contact ${i + 1}`);
            return false;
          }
          if (!contact.email) {
            toastError(`Email is required for contact ${i + 1}`);
            return false;
          }
          if (!contact.phoneNumber) {
            toastError(`Phone number is required for contact ${i + 1}`);
            return false;
          }
          if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            toastError(`Invalid email format for contact ${i + 1}`);
            return false;
          }
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
        return !formData.hospitalName || !formData.email || !formData.geoLocation;
      case 2:
        return !formData.stateLicenseNumber || 
               !formData.hospitalAdress || 
               !formData.phoneNumber || 
               !formData.stateId ||
               !formData.licenseExpiryDate;
      case 3:
        return !formData.bankName || 
               !formData.bankCode || 
               !formData.accountName || 
               !formData.accountNumber ||
               !formData.accountType;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Navigation functions
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);

    try {
      const result = await dispatch(createProvider(formData)).unwrap();
      toastSuccess("Provider registered successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      toastError(err || "Failed to register provider");
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCurrentStep(1);
    setFormData({
      hospitalName: "",
      code: "",
      email: "",
      hospitalAdress: "",
      phoneNumber: "",
      bankName: "",
      accountNumber: "",
      bankCode: "",
      accountName: "",
      accountType: "",
      bankVeririfationNumber: "",
      stateLicenseNumber: "",
      licenseExpiryDate: "",
      geoLocation: "",
      stateId: "",
      hmoId: user?.hmoId || "",
      organizationId: "e53bf4dc-162f-41e0-8528-6a0553dad5e3",
      ownership: "",
      providerType: "",
      contacts: [
        {
          name: "",
          designation: "",
          email: "",
          phoneNumber: "",
        },
      ],
    });
    setErrors({});
  };

  const handleGoToProviders = () => {
    setShowSuccessModal(false);
    navigate("/state/providers/all");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital / NHIA Approved Facility <span className="text-red-500">*</span>
                </label>
                <NhiaApprovedSelect
                  value={formData.hospitalName}
                  error={errors.hospitalName}
                  onChange={(hospital) => {
                    setFormData((prev) => ({
                      ...prev,
                      hospitalName: hospital.name,
                      code: hospital.code,
                      hospitalAdress: hospital.address,
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.hospitalName;
                      delete newErrors.code;
                      delete newErrors.hospitalAdress;
                      return newErrors;
                    });
                  }}
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />

              <Input
                type="text"
                name="geoLocation"
                label="Location / Address"
                value={formData.geoLocation}
                onChange={handleInputChange}
                error={errors.geoLocation}
                required
              />

              <FormSelect
                label="Provider Type"
                name="providerType"
                value={formData.providerType}
                onChange={handleInputChange}
                error={errors.providerType}
                required
              >
                <option value="">Select provider type</option>
                {providerTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Ownership Type"
                name="ownership"
                value={formData.ownership}
                onChange={handleInputChange}
                error={errors.ownership}
                required
              >
                <option value="">Select ownership type</option>
                {ownershipTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <Input
                type="text"
                name="code"
                label="NHIA Provider Code"
                value={formData.code}
                onChange={handleInputChange}
                error={errors.code}
                readOnly
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              License & Contact Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <Input
                type="text"
                name="stateLicenseNumber"
                label="License Number"
                value={formData.stateLicenseNumber}
                onChange={handleInputChange}
                error={errors.stateLicenseNumber}
                required
              />

              <Input
                type="date"
                name="licenseExpiryDate"
                label="License Expiry Date"
                value={formData.licenseExpiryDate}
                onChange={handleInputChange}
                error={errors.licenseExpiryDate}
                required
              />

              <Input
                type="text"
                name="hospitalAdress"
                label="Hospital Address"
                value={formData.hospitalAdress}
                onChange={handleInputChange}
                error={errors.hospitalAdress}
                required
                readOnly
              />

              <Input
                inputMode="numeric"
                maxLength={11}
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={errors.phoneNumber}
                required
              />

              <FormSelect
                label="State"
                name="stateId"
                value={formData.stateId}
                onChange={handleInputChange}
                error={errors.stateId}
                required
              >
                <option value="">
                  {statesLoading ? "Loading states..." : "Select State"}
                </option>
                {states?.map((stateItem) => (
                  <option key={stateItem.id} value={stateItem.id}>
                    {stateItem.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Banking & Contact Persons
            </h2>

            {/* Banking Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                Banking Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <BankSelect
                  value={formData.bankName}
                  error={errors.bankName}
                  onChange={(bank) => {
                    setFormData((prev) => ({
                      ...prev,
                      bankName: bank.name,
                      bankCode: bank.code,
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.bankName;
                      delete newErrors.bankCode;
                      return newErrors;
                    });
                  }}
                />

                <Input
                  type="text"
                  name="bankCode"
                  label="Bank Code"
                  value={formData.bankCode}
                  onChange={handleInputChange}
                  error={errors.bankCode}
                  readOnly
                />

                <Input
                  type="text"
                  name="accountName"
                  label="Account Name"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  error={errors.accountName}
                  required
                />

                <Input
                  inputMode="numeric"
                  maxLength={10}
                  name="accountNumber"
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  error={errors.accountNumber}
                  required
                />

                <FormSelect
                  label="Account Type"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  error={errors.accountType}
                  required
                >
                  <option value="">Select account type</option>
                  {accountTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>

                <Input
                  inputMode="numeric"
                  maxLength={11}
                  name="bankVeririfationNumber"
                  label="BVN (Bank Verification Number)"
                  value={formData.bankVeririfationNumber}
                  onChange={handleInputChange}
                  error={errors.bankVeririfationNumber}
                />
              </div>
            </div>

            {/* Contact Persons */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium text-gray-800">
                  MD Contact Details
                </h3>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1 text-sm text-[#DC2626] hover:text-red-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Contact
                </button>
              </div>

              {formData.contacts.map((contact, index) => (
                <div
                  key={index}
                  className="relative border border-gray-200 rounded-lg p-4 mt-4"
                >
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="name"
                      label="Full Name"
                      value={contact.name}
                      onChange={(e) => handleContactChange(e, index)}
                      error={errors[`contact_name_${index}`]}
                      required
                    />

                    <Input
                      type="text"
                      name="designation"
                      label="Designation"
                      value={contact.designation}
                      onChange={(e) => handleContactChange(e, index)}
                      error={errors[`contact_designation_${index}`]}
                      required
                    />

                    <Input
                      type="email"
                      name="email"
                      label="Email Address"
                      value={contact.email}
                      onChange={(e) => handleContactChange(e, index)}
                      error={errors[`contact_email_${index}`]}
                      required
                    />

                    <Input
                      inputMode="numeric"
                      maxLength={11}
                      name="phoneNumber"
                      label="Phone Number"
                      value={contact.phoneNumber}
                      onChange={(e) => handleContactChange(e, index)}
                      error={errors[`contact_phone_${index}`]}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Summary for step 3 (optional preview)
  const getStepSummary = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "License & Contact Information";
      case 3:
        return "Banking & Contact Persons";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm px-8 py-10">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <h1 className="text-2xl font-semibold text-gray-700">
                Register New Provider
              </h1>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}: {getStepSummary()}
              </span>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

            {/* Step Content */}
            <form onSubmit={handleSubmit}>
              <div className="mt-10">{renderStepContent()}</div>

              {/* Navigation Buttons */}
              <div className="mt-10 flex items-center justify-between">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="flex items-center gap-2 px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold rounded-md"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate("/state/providers/all")}
                      className="px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold rounded-md"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={isNextDisabled()}
                    className={`px-8 py-2.5 rounded-md font-medium transition-colors ${
                      isNextDisabled()
                        ? "bg-red-200 text-red-400 cursor-not-allowed"
                        : "bg-[#DC2626] text-white hover:bg-red-700"
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-2.5 rounded-md font-medium transition-colors ${
                      loading
                        ? "bg-red-200 text-red-400 cursor-not-allowed"
                        : "bg-[#DC2626] text-white hover:bg-red-700"
                    }`}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                )}
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ProviderConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        providerData={{
          hospitalName: formData.hospitalName,
          email: formData.email,
          providerType: formData.providerType,
          phoneNumber: formData.phoneNumber,
        }}
        isLoading={loading}
      />

      {/* Success Modal */}
      <ProviderSuccessModal
        isOpen={showSuccessModal}
        onCreateAnother={handleCreateAnother}
        onGoToProviders={handleGoToProviders}
        providerDetails={{
          providerName: formData.hospitalName,
          providerCode: formData.code,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        }}
      />
    </>
  );
};

export default RegisterProvider;