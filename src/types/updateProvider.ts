export type Contact = {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
};

export type HospitalData = {
  hospitalName: string;
  code: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: "Domiciliary";
  bankVeririfationNumber: string;
  stateLicenseNumber: string;
  licenseExpiryDate: string;
  geoLocation: string;
  stateId: string;
  organizationId: string;
  providerType: "General";
  ownership: "Public";
  contacts: Contact[];
  id: string;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
  apiKey: string;
};

export type HospitalResponse = {
  data: HospitalData;
  message: string;
  isSuccess: boolean;
};