// patient.types.ts
export interface PatientRegistrationData {
  providerId: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: 'NHIA' | string; 
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
}

// This matches your actual API response structure
export interface PatientData {
  id: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
  providerId: string;
  isActive: boolean;
  createdDate: string;
  age?: number; // Optional since it might not always be present
}

// Update the response interface to match your API
export interface PatientRegistrationResponse {
  data: PatientData;
  message: string;
  isSuccess: boolean;
}

export interface PatientRegistrationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  patientData: PatientRegistrationResponse | null;
  registeredPatientId: string | null;
}