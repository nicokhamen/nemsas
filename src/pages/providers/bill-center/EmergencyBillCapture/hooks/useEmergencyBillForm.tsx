import { useState, useCallback } from "react";
import type { ProductItem } from "../../../../../types/productType";
// import type { ProductItem } from "../../types/productType";

interface FormState {
  selectedDepartment: string;
  selectedServiceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string;
  selectedMedicalHistory: string[];
  attendingPhysician: string;
}

interface DiagnosisState {
  selectedDiagnoses: string[];
  diagnosisList: Array<{
    id: string;
    type: string;
    code: string;
    name: string;
    note: string;
  }>;
  editingNoteId: string | null;
  noteInput: string;
}

interface FileState {
  uploadedFiles: File[];
}

interface ProductServiceState {
  items: ProductItem[];
}

interface ModalState {
  showConfirmModal: boolean;
}

export const useEmergencyBillForm = (patientId: string) => {
  const [formState, setFormState] = useState<FormState>({
    selectedDepartment: "",
    selectedServiceType: "",
    encounterStartDateTime: new Date().toISOString().split('T')[0],
    dischargeStatus: "",
    dischargeDate: "",
    selectedMedicalHistory: [],
    attendingPhysician: "",
  });

  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>({
    selectedDiagnoses: [],
    diagnosisList: [],
    editingNoteId: null,
    noteInput: "",
  });

  const [fileState, setFileState] = useState<FileState>({
    uploadedFiles: [],
  });

  const [productServiceState, setProductServiceState] = useState<ProductServiceState>({
    items: [],
  });

  const [modalState, setModalState] = useState<ModalState>({
    showConfirmModal: false,
  });

  const updateFormState = useCallback((updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDiagnosisState = useCallback((updates: Partial<DiagnosisState>) => {
    setDiagnosisState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFileState = useCallback((files: File[]) => {
    setFileState({ uploadedFiles: files });
  }, []);

  const updateProductServiceState = useCallback((updates: Partial<ProductServiceState>) => {
    setProductServiceState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateModalState = useCallback((updates: Partial<ModalState>) => {
    setModalState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formState,
    diagnosisState,
    fileState,
    productServiceState,
    modalState,
    updateFormState,
    updateDiagnosisState,
    updateFileState,
    updateProductServiceState,
    updateModalState,
    patientId,
  };
};