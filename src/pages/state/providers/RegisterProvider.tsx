import React, { useEffect, useState } from "react";
import Input from "../../../components/form/Input";
import FormSelect from "../../../components/form/FormSelect";
import { providerTypeOptions } from "../../../utils/providerType";
import { ownershipTypeOptions } from "../../../utils/ownershipType";
// import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import type { CreateProviderPayload } from "../../../types/stateProvider";
import { createProvider } from "../../../services/thunks/stateProviderThunk";
import { fetchStates } from "../../../services/thunks/fetchStatesThunk";
import { accountTypeOptions } from "../../../utils/accountTypeUtils";
import ProviderConfirmModal from "../../../components/ui/ProviderConfirmModal";
import { useNavigate } from "react-router-dom";
import BankSelect from "../../../components/ui/BankSelect";
import { enforceDigits } from "../../../utils/enforceDigits";
import NhiaApprovedSelect from "../../../components/ui/NhiaApprovedSelect";
import { useCustomToast } from "../../../hooks/useCustomToast";

interface FormErrors {
  [key: string]: string;
}

const RegisterProvider: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useCustomToast();
  const { loading, error } = useAppSelector((state) => state.createProvider);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { data: states, loading: statesLoading } = useAppSelector(
    (state) => state.allStates,
  );

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        hmoId: user.hmoId || "",
        // organizationId: user.organizationId || "",
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
    providerType: "General",
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

    //  Apply rules
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

    // Clear error
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.hospitalName)
      newErrors.hospitalName = "Hospital name is required";
    if (!formData.code) newErrors.code = "Provider code is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.hospitalAdress)
      newErrors.hospitalAdress = "Hospital address is required";
    // Phone number (11 digits check)
    if (formData.phoneNumber && formData.phoneNumber.length !== 11) {
      newErrors.phoneNumber = "Phone number must be exactly 11 digits";
    }
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    // Account number (10 digits)
    if (formData.accountNumber && formData.accountNumber.length !== 10) {
      newErrors.accountNumber = "Account number must be exactly 10 digits";
    }
    if (!formData.bankCode) newErrors.bankCode = "Bank code is required";
    if (!formData.accountName)
      newErrors.accountName = "Account name is required";
    if (!formData.accountType)
      newErrors.accountType = "Account type is required";

    // BVN (11 digits)
    if (
      formData.bankVeririfationNumber &&
      formData.bankVeririfationNumber.length !== 11
    ) {
      newErrors.bankVeririfationNumber = "BVN must be exactly 11 digits";
    }

    if (!formData.stateLicenseNumber)
      newErrors.stateLicenseNumber = "License number is required";
    if (!formData.licenseExpiryDate)
      newErrors.licenseExpiryDate = "License expiry date is required";
    if (!formData.geoLocation) newErrors.geoLocation = "Location is required";
    if (!formData.stateId) newErrors.stateId = "State ID is required";
    // if (!formData.hmoId) newErrors.hmoId = "HMO ID is required";
    // if (!formData.organizationId)
    //   newErrors.organizationId = "Organization ID is required";

    // Validate contacts
    formData.contacts.forEach((contact, index) => {
      if (!contact.name)
        newErrors[`contact_name_${index}`] = "Contact name is required";
      if (!contact.designation)
        newErrors[`contact_designation_${index}`] = "Designation is required";
      if (!contact.email)
        newErrors[`contact_email_${index}`] = "Contact email is required";
      if (!contact.phoneNumber)
        newErrors[`contact_phone_${index}`] = "Contact phone is required";

      // Email validation
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        newErrors[`contact_email_${index}`] = "Invalid email format";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Show confirmation modal instead of submitting immediately
    setShowConfirmModal(true);
  };

  // Add this new function to handle the actual submission after confirmation
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);

    try {
      const result = await dispatch(createProvider(formData)).unwrap();
      toast.success("Provider registered successfully!");
      navigate("/state/providers/all");

      // Reset form on success
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
        hmoId: "",
        organizationId: "e53bf4dc-162f-41e0-8528-6a0553dad5e3",
        ownership: "",
        providerType: "General",
        contacts: [
          {
            name: "",
            designation: "",
            email: "",
            phoneNumber: "",
          },
        ],
      });
    } catch (err: any) {
      toast.error(err || "Failed to register provider");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
            {/* Title */}
            <h2 className="text-red-500 font-semibold mb-6">
              Provider Information
            </h2>

            {/* Form Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* <Input
                type="text"
                name="hospitalName"
                placeholder="Hospital Name"
                value={formData.hospitalName}
                onChange={handleInputChange}
                error={errors.hospitalName}
                className="input"
                required
              /> */}
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

                  // clear related errors
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.hospitalName;
                    delete newErrors.code;
                    delete newErrors.hospitalAdress;
                    return newErrors;
                  });
                  
                }}
              />

              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                className="input"
                required
              />

              <Input
                type="text"
                name="geoLocation"
                placeholder="Location"
                value={formData.geoLocation}
                onChange={handleInputChange}
                error={errors.geoLocation}
                className="input"
                required
              />

              <FormSelect
                label="Provider Type"
                name="providerType"
                value={formData.providerType}
                onChange={handleInputChange}
                error={errors.providerType}
              >
                {providerTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <Input
                type="text"
                name="code"
                placeholder="NHIA Provider Code"
                value={formData.code}
                onChange={handleInputChange}
                error={errors.code}
                className="input"
                required
                readOnly
              />

              <FormSelect
                label="Ownership Type"
                name="ownership"
                value={formData.ownership}
                onChange={handleInputChange}
                error={errors.ownershipType}
              >
                {ownershipTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <Input
                type="text"
                name="stateLicenseNumber"
                placeholder="License Number"
                value={formData.stateLicenseNumber}
                onChange={handleInputChange}
                error={errors.stateLicenseNumber}
                className="input"
                required
              />

              <Input
                type="text"
                name="hospitalAdress"
                placeholder="Hospital Address"
                value={formData.hospitalAdress}
                onChange={handleInputChange}
                error={errors.hospitalAdress}
                className="input"
                required
                readOnly
              />

              <Input
                inputMode="numeric"
                maxLength={11}
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={errors.phoneNumber}
                className="input"
                required
              />

              {/* <Input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={handleInputChange}
                error={errors.bankName}
                className="input"
                required
              /> */}
              <BankSelect
                value={formData.bankName}
                error={errors.bankName}
                onChange={(bank) => {
                  setFormData((prev) => ({
                    ...prev,
                    bankName: bank.name,
                    bankCode: bank.code,
                  }));

                  // clear errors
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
                placeholder="Bank Code"
                value={formData.bankCode}
                onChange={handleInputChange}
                error={errors.bankCode}
                className="input"
                required
                readOnly
              />
              <Input
                type="text"
                name="accountName"
                placeholder="Account Name"
                value={formData.accountName}
                onChange={handleInputChange}
                error={errors.accountName}
                className="input"
                required
              />

              <Input
                inputMode="numeric"
                maxLength={10}
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                error={errors.accountNumber}
                className="input"
                required
              />

              <FormSelect
                label="Account Type"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
              >
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
                placeholder="Bank Verification Number"
                value={formData.bankVeririfationNumber}
                onChange={handleInputChange}
                error={errors.bankVeririfationNumber}
                className="input"
                required
              />

              <Input
                type="date"
                name="licenseExpiryDate"
                placeholder="License Expiry Date"
                value={formData.licenseExpiryDate}
                onChange={handleInputChange}
                error={errors.licenseExpiryDate}
                className="input"
                required
              />

              <FormSelect
                label="State"
                name="stateId"
                value={formData.stateId}
                onChange={handleInputChange}
                error={errors.stateId}
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

            {/* Contact Details */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-red-500 font-semibold">
                  MD Contact Details
                </h3>
                {/* <button
                type="button"
                onClick={addContact}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                + Add Another Contact
              </button> */}
              </div>

              {formData.contacts.map((contact, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 mb-4 relative"
                >
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => handleContactChange(e, index)}
                    error={errors[`contact_name_${index}`]}
                    className="input"
                    required
                  />

                  <Input
                    type="text"
                    name="designation"
                    placeholder="Designation"
                    value={contact.designation}
                    onChange={(e) => handleContactChange(e, index)}
                    error={errors[`contact_designation_${index}`]}
                    className="input"
                    required
                  />

                  <Input
                    inputMode="numeric"
                    maxLength={11}
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={contact.phoneNumber}
                    onChange={(e) => handleContactChange(e, index)}
                    error={errors[`contact_phone_${index}`]}
                    className="input"
                    required
                  />

                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) => handleContactChange(e, index)}
                    error={errors[`contact_email_${index}`]}
                    className="input"
                    required
                  />

                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </form>
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
    </>
  );
};

export default RegisterProvider;
