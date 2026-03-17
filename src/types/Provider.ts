

export interface ProviderContact {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
}

export interface Provider {
  hospitalName: string;
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
  contacts: ProviderContact[];
  id: string;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
}

export interface ProviderListResponse {
  data: Provider[];
  message: string;
  isSuccess: boolean;
}