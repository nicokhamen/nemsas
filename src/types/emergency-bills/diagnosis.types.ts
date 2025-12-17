// diagnosis.types.ts

export interface Diagnosis {
  id: string;
  emergencyBillId: string;
  type: string;
  code: string;
  diagnosis: string;
  note: string;
  isActive: boolean;
  createdDate: string;
}

export interface DiagnosisResponse {
  data: Diagnosis;
  message: string;
  isSuccess: boolean;
}

export interface DiagnosesResponse {
  data: Diagnosis[];
  message: string;
  isSuccess: boolean;
}