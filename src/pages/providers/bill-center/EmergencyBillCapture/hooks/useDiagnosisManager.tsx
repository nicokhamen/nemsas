import { useCallback } from "react";
import type { ICDItem } from "../../../../../types/emergency-bill";

interface Diagnosis {
  id: string;
  type: string;
  code: string;
  name: string;
  note: string;
}

interface DiagnosisState {
  selectedDiagnoses: string[];
  diagnosisList: Diagnosis[];
  editingNoteId: string | null;
  noteInput: string;
}

interface UseDiagnosisManagerReturn {
  diagnoses: Diagnosis[];
  editingNoteId: string | null;
  noteInput: string;
  handleSelectDiagnosis: (selectedItem: ICDItem & { type: string }) => void;
  handleRemoveDiagnosis: (id: string, e: React.MouseEvent) => void;
  handleEditNote: (id: string) => void;
  handleSaveNote: (id: string) => void;
  handleCancelNote: () => void;
  handleDiagnosisSelection: (id: string) => void;
}

export const useDiagnosisManager = (
  diagnosisState: DiagnosisState,
  updateDiagnosisState: (updates: Partial<DiagnosisState>) => void
): UseDiagnosisManagerReturn => {
  const handleSelectDiagnosis = useCallback((selectedItem: ICDItem & { type: string }) => {
    const newId = Date.now().toString();
    const newDiagnosis: Diagnosis = {
      id: newId,
      type: selectedItem.type,
      code: selectedItem.code,
      name: selectedItem.name,
      note: `Selected from search: ${selectedItem.name}`,
    };

    updateDiagnosisState({
      diagnosisList: [...diagnosisState.diagnosisList, newDiagnosis],
      selectedDiagnoses: [...diagnosisState.selectedDiagnoses, newId],
    });
  }, [diagnosisState, updateDiagnosisState]);

  const handleRemoveDiagnosis = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newDiagnosisList = diagnosisState.diagnosisList.filter(item => item.id !== id);
    const newSelectedDiagnoses = diagnosisState.selectedDiagnoses.filter(itemId => itemId !== id);
    
    updateDiagnosisState({
      diagnosisList: newDiagnosisList,
      selectedDiagnoses: newSelectedDiagnoses,
      editingNoteId: diagnosisState.editingNoteId === id ? null : diagnosisState.editingNoteId,
      noteInput: diagnosisState.editingNoteId === id ? "" : diagnosisState.noteInput,
    });
  }, [diagnosisState, updateDiagnosisState]);

  const handleEditNote = useCallback((id: string) => {
    const item = diagnosisState.diagnosisList.find(d => d.id === id);
    updateDiagnosisState({
      editingNoteId: id,
      noteInput: item?.note || "",
    });
  }, [diagnosisState.diagnosisList, updateDiagnosisState]);

  const handleSaveNote = useCallback((id: string) => {
    const updatedList = diagnosisState.diagnosisList.map(item =>
      item.id === id ? { ...item, note: diagnosisState.noteInput } : item
    );
    
    updateDiagnosisState({
      diagnosisList: updatedList,
      editingNoteId: null,
      noteInput: "",
    });
  }, [diagnosisState, updateDiagnosisState]);

  const handleCancelNote = useCallback(() => {
    updateDiagnosisState({
      editingNoteId: null,
      noteInput: "",
    });
  }, [updateDiagnosisState]);

  const handleDiagnosisSelection = useCallback((id: string) => {
    const newSelectedDiagnoses = diagnosisState.selectedDiagnoses.includes(id)
      ? diagnosisState.selectedDiagnoses.filter(v => v !== id)
      : [...diagnosisState.selectedDiagnoses, id];
    
    updateDiagnosisState({ selectedDiagnoses: newSelectedDiagnoses });
  }, [diagnosisState.selectedDiagnoses, updateDiagnosisState]);

  return {
    diagnoses: diagnosisState.diagnosisList,
    editingNoteId: diagnosisState.editingNoteId,
    noteInput: diagnosisState.noteInput,
    handleSelectDiagnosis,
    handleRemoveDiagnosis,
    handleEditNote,
    handleSaveNote,
    handleCancelNote,
    handleDiagnosisSelection,
  };
};