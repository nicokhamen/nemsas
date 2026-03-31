import React, { useEffect, useState } from "react";
// import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
// import { createProvider, CreateProviderPayload, ProviderContact } from "../store/providersSlice";
import Input from "../../../components/form/Input";
import FormSelect from "../../../components/form/FormSelect";
import { providerTypeOptions } from "../../../utils/providerType";
import { ownershipTypeOptions } from "../../../utils/ownershipType";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import type { CreateProviderPayload } from "../../../types/stateProvider";
import { createProvider } from "../../../services/thunks/stateProviderThunk";
import { fetchStates } from "../../../services/thunks/fetchStatesThunk";

interface FormErrors {
  [key: string]: string;
}

const RegisterProvider: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.createProvider);
  const { data: states, loading: statesLoading } = useAppSelector(
    (state) => state.allStates,
  );

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

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
    hmoId: "",
    organizationId: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
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
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.accountNumber)
      newErrors.accountNumber = "Account number is required";
    if (!formData.bankCode) newErrors.bankCode = "Bank code is required";
    if (!formData.accountName)
      newErrors.accountName = "Account name is required";
    if (!formData.accountType)
      newErrors.accountType = "Account type is required";
    if (!formData.bankVeririfationNumber)
      newErrors.bankVeririfationNumber = "BVN is required";
    if (!formData.stateLicenseNumber)
      newErrors.stateLicenseNumber = "License number is required";
    if (!formData.licenseExpiryDate)
      newErrors.licenseExpiryDate = "License expiry date is required";
    if (!formData.geoLocation) newErrors.geoLocation = "Location is required";
    if (!formData.stateId) newErrors.stateId = "State ID is required";
    if (!formData.hmoId) newErrors.hmoId = "HMO ID is required";
    if (!formData.organizationId)
      newErrors.organizationId = "Organization ID is required";

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

    try {
      const result = await dispatch(createProvider(formData)).unwrap();
      toast.success("Provider registered successfully!");

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
        organizationId: "",
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
              <Input
                type="text"
                name="hospitalName"
                placeholder="Hospital Name"
                value={formData.hospitalName}
                onChange={handleInputChange}
                error={errors.hospitalName}
                className="input"
                required
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
              />

              <Input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={errors.phoneNumber}
                className="input"
                required
              />

              <Input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={handleInputChange}
                error={errors.bankName}
                className="input"
                required
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
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                error={errors.accountNumber}
                className="input"
                required
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
              />

              <Input
                type="text"
                name="accountType"
                placeholder="Account Type"
                value={formData.accountType}
                onChange={handleInputChange}
                error={errors.accountType}
                className="input"
                required
              />

              <Input
                type="text"
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

              <Input
                type="text"
                name="hmoId"
                placeholder="HMO ID"
                value={formData.hmoId}
                onChange={handleInputChange}
                error={errors.hmoId}
                className="input"
              />

              <Input
                type="text"
                name="organizationId"
                placeholder="Organization ID"
                value={formData.organizationId}
                onChange={handleInputChange}
                error={errors.organizationId}
                className="input"
              />
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
                    type="tel"
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
    </>
  );
};

export default RegisterProvider;
