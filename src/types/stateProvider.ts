// POST Providers Type
export type ProviderContact = {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
};

export type CreateProviderPayload = {
  hospitalName: string;
  code: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;

  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: string;

  bankVeririfationNumber: string;

  stateLicenseNumber: string;
  licenseExpiryDate: string;

  geoLocation: string;

  stateId: string;
  hmoId: string;
  organizationId: string;

  providerType: string;
  ownership: string;

  contacts: ProviderContact[];
};

// GET Providers Type

export type Provider = {
  hospitalName: string;
  code: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;

  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: string;

  bankVeririfationNumber: string;

  stateLicenseNumber: string;
  licenseExpiryDate: string;

  geoLocation: string;

  stateId: string;
  organizationId: string;
  hmoId: string;

  providerType: "General";

  contacts: ProviderContact[];

  id: string;
  isActive: boolean;
  createdDate: string;
  apiKey: string;
};

export type GetProvidersResponse = {
  data: Provider[];
  message: string;
  isSuccess: boolean;
};