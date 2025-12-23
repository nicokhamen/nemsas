import type { ProductItem } from "../types/productType";

interface Diagnosis {
  id: string;
  type: string;
  code: string;
  name: string;
  note: string;
}

interface BuildEncounterPayloadParams {
  patientId: string;
  formState: {
    selectedDepartment: string;
    selectedServiceType: string;
    encounterStartDateTime: string;
    dischargeStatus: string;
    dischargeDate: string;
    selectedMedicalHistory: string[];
    attendingPhysician: string;
  };
  diagnoses: Diagnosis[];
  selectedDiagnoses: string[];
  selectedMedicalHistory: string[];
  productServiceItems: ProductItem[];
}

export const buildEncounterPayload = ({
  patientId,
  formState,
  diagnoses,
  selectedDiagnoses,
  selectedMedicalHistory,
  productServiceItems,
}: BuildEncounterPayloadParams) => {
  const filteredDiagnoses = diagnoses
    .filter((diagnosis) => selectedDiagnoses.includes(diagnosis.id))
    .map((diagnosis) => ({
      type: diagnosis.type,
      code: diagnosis.code,
      diagnosis: diagnosis.name,
      note: diagnosis.note,
    }));

  const productServices = productServiceItems.map((item) => ({
    productId: item.id,
    quantity: item.quantity || 1,
    price: item.price || 0,
    flag: "ACTIVE",
  }));

  return {
    patientId: patientId,
    department: formState.selectedDepartment,
    serviceType: formState.selectedServiceType,
    encounterStartDateTime: new Date(formState.encounterStartDateTime).toISOString(),
    dischargeStatus: formState.dischargeStatus,
    dischargeDate: formState.dischargeDate ? new Date(formState.dischargeDate).toISOString() : "",
    diagnoses: filteredDiagnoses,
    serviceCategories: selectedMedicalHistory,
    productServices: productServices,
    attendingPhysician: formState.attendingPhysician,
    supportingDocuments: [],
  };
};