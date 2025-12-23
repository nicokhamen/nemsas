import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../services/store/store";
import { useCustomToast } from "../../../hooks/useCustomToast";
import { useEmergencyBillData } from "./hooks/useEmergencyBillData";
import { useEmergencyBillForm } from "./hooks/useEmergencyBillForm";
import { useDiagnosisManager } from "./hooks/useDiagnosisManager";
import { createEncounter } from "../../../services/thunks/departmentThunk";
import EncounterDetailsSection from "./sections/EncounterDetailsSection";
import ServiceCategorySection from "./sections/ServiceCategorySection";
import DiagnosisSection from "./sections/DiagnosisSection";
import FileUploadSection from "./sections/FileUploadSection";
import PhysicianSection from "./sections/PhysicianSection";
import ProductServiceSection from "./sections/ProductServiceSection";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import  {buildEncounterPayload}  from "../../../utils/buildEncounterPayload"

interface EmergencyBillCaptureProps {
  patientId: string;
}

export default function EmergencyBillCapture({ patientId }: EmergencyBillCaptureProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success: toastSuccess } = useCustomToast();
  const navigate = useNavigate();

  const routeToAllPatients = () => {
    navigate("/emergency/bills");
  };

  const {
    departments,
    categories,
    departmentsLoading,
    departmentsError,
  } = useEmergencyBillData();

  const {
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
  } = useEmergencyBillForm(patientId);

  const {
    diagnoses,
    editingNoteId,
    noteInput,
    handleSelectDiagnosis,
    handleRemoveDiagnosis,
    handleEditNote,
    handleSaveNote,
    handleCancelNote,
    handleDiagnosisSelection,
  } = useDiagnosisManager(diagnosisState, updateDiagnosisState);

  const {
    loading: billLoading,
    error: billError,
    success: billSuccess,
  } = useSelector((state: RootState) => state.encounter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    updateModalState({ showConfirmModal: true });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!patientId) errors.push("Please register a patient first");
    if (!formState.selectedDepartment) errors.push("Please select a department");
    if (!formState.selectedServiceType) errors.push("Please select a service type");
    if (diagnoses.length === 0) errors.push("Please add at least one diagnosis");
    if (!formState.attendingPhysician.trim()) errors.push("Please enter attending physician name");
    if (productServiceState.items.length === 0) errors.push("Please add at least one product/service");

    return errors;
  };

  const handleConfirmSubmit = () => {
    updateModalState({ showConfirmModal: false });

    const encounterData = buildEncounterPayload({
      patientId,
      formState,
      diagnoses,
      selectedDiagnoses: diagnosisState.selectedDiagnoses,
      selectedMedicalHistory: formState.selectedMedicalHistory,
      productServiceItems: productServiceState.items,
    });

    console.log("Submitting encounter data:", encounterData);
    
    dispatch(createEncounter(encounterData));
    toastSuccess("Bill created successfully");
    routeToAllPatients();
  };

  const handleModalClose = () => {
    updateModalState({ showConfirmModal: false });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Emergency Bill Capture new
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <EncounterDetailsSection
            departments={departments}
            departmentsLoading={departmentsLoading}
            departmentsError={departmentsError}
            selectedDepartment={formState.selectedDepartment}
            selectedServiceType={formState.selectedServiceType}
            encounterStartDateTime={formState.encounterStartDateTime}
            dischargeStatus={formState.dischargeStatus}
            dischargeDate={formState.dischargeDate}
            onDepartmentChange={(value) => updateFormState({ selectedDepartment: value })}
            onServiceTypeChange={(value) => updateFormState({ selectedServiceType: value })}
            onStartDateChange={(value) => updateFormState({ encounterStartDateTime: value })}
            onDischargeStatusChange={(value) => updateFormState({ dischargeStatus: value })}
            onDischargeDateChange={(value) => updateFormState({ dischargeDate: value })}
          />

          <ServiceCategorySection
            categories={categories}
            selectedMedicalHistory={formState.selectedMedicalHistory}
            onMedicalHistoryChange={(categoryId) => {
              const newSelection = formState.selectedMedicalHistory.includes(categoryId)
                ? formState.selectedMedicalHistory.filter((id) => id !== categoryId)
                : [...formState.selectedMedicalHistory, categoryId];
              updateFormState({ selectedMedicalHistory: newSelection });
            }}
          />
        </div>

        <DiagnosisSection
          diagnoses={diagnoses}
          selectedDiagnoses={diagnosisState.selectedDiagnoses}
          editingNoteId={editingNoteId}
          noteInput={noteInput}
          onSelectDiagnosis={handleSelectDiagnosis}
          onRemoveDiagnosis={handleRemoveDiagnosis}
          onEditNote={handleEditNote}
          onSaveNote={handleSaveNote}
          onCancelNote={handleCancelNote}
          onDiagnosisSelection={handleDiagnosisSelection}
          setNoteInput={(value) => updateDiagnosisState({ noteInput: value })}
        />

        <FileUploadSection onFilesSelected={updateFileState} />

        <PhysicianSection
          attendingPhysician={formState.attendingPhysician}
          onPhysicianChange={(value) => updateFormState({ attendingPhysician: value })}
        />

        <ProductServiceSection
          productServiceItems={productServiceState.items}
          onSelectItem={(item) => {
            const exists = productServiceState.items.some(existingItem => existingItem.id === item.id);
            if (!exists) {
              updateProductServiceState({ items: [...productServiceState.items, item] });
            }
          }}
          onUpdateQuantity={(id, quantity) => {
            const updatedItems = productServiceState.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            );
            updateProductServiceState({ items: updatedItems });
          }}
          onRemoveItem={(id) => {
            const filteredItems = productServiceState.items.filter(item => item.id !== id);
            updateProductServiceState({ items: filteredItems });
          }}
        />
      </form>

      <ConfirmModal
        isOpen={modalState.showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmSubmit}
        title="Confirm Emergency Bill Submission"
        message={`Are you sure you want to submit this emergency bill? 
        
        • Total Amount: $${productServiceState.items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)}
        
        This action cannot be undone.`}
        confirmText="Submit Bill"
        cancelText="Cancel"
        type="warning"
        isLoading={billLoading}
      />
    </>
  );
}