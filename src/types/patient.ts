// patient.types.ts
export interface PatientRegistrationData {
  providerId: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: 'NHIA' | string;
  dateOfBirth: string; // ISO string
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
}

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
  age: number;
}

// Response interface for single patient registration
export interface PatientRegistrationResponse {
  data: PatientData;
  message: string;
  isSuccess: boolean;
}

// Response interface for getting all patients
export interface GetAllPatientsResponse {
  data: PatientData[];
  message: string;
  isSuccess: boolean;
}

export interface PatientRegistrationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  patientData: PatientRegistrationResponse | null;
  registeredPatientId: string | null;
  // New state for getAllPatients
  patientsList: PatientData[];
  patientsLoading: boolean;
  patientsError: string | null;
}

// Error response interface
export interface ApiErrorResponse {
  message: string;
  isSuccess: boolean;
  errors?: Record<string, string[]>;
}