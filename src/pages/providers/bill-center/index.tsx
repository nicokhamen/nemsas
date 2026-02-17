import React, { useState, useEffect } from "react";
import PatientForm from "./PatientForm";
import EmergencyBillCapture from "./EmergencyBillCapture";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

const tabs = [
  { key: "patient", label: "Patient Record" },
  { key: "emergency", label: "Emergency Bill" },
];

const EBillCapture: React.FC = () => {
  const [activeTab, setActiveTab] = useState("patient");
  const [registeredPatientId, setRegisteredPatientId] = useState<string>("");
  const [patientLocked, setPatientLocked] = useState(false);
  
  // Get emergency bills from Redux
  const { bills: emergencyBills, loading: billsLoading } = useSelector(
    (state: RootState) => state.emergencyBills
  );

  // Extract unique patients from emergency bills
  const availablePatients = React.useMemo(() => {
    if (!emergencyBills || emergencyBills.length === 0) return [];
    
    const uniquePatientsMap = new Map();
    emergencyBills.forEach((bill: any) => {
      if (bill.patient && bill.patient.id) {
        uniquePatientsMap.set(bill.patient.id, bill.patient);
      }
    });
    
    return Array.from(uniquePatientsMap.values());
  }, [emergencyBills]);

  useEffect(() => {
    console.log("EBillCapture - Current state:", {
      activeTab,
      registeredPatientId,
      hasPatientId: !!registeredPatientId,
      patientLocked,
      availablePatientsCount: availablePatients.length,
    });
  }, [activeTab, registeredPatientId, patientLocked, availablePatients]);

  const handlePatientAttached = (patientId: string) => {
    console.log("Patient attached for emergency bill:", patientId);
    setRegisteredPatientId(patientId);
    setPatientLocked(true);
    setActiveTab("emergency");
  };

  const handlePatientRegistered = (patientId: string) => {
    console.log("New patient registered:", patientId);
    setRegisteredPatientId(patientId);
    setPatientLocked(true);
    setActiveTab("emergency");
  };

  const renderContent = () => {
    console.log("renderContent - activeTab:", activeTab);

    switch (activeTab) {
      case "patient":
        return (
          <PatientForm 
            onPatientRegistered={handlePatientRegistered}
            onAttachToPatient={handlePatientAttached}
            availablePatients={availablePatients}
          />
        );
      case "emergency":
        return (
          <EmergencyBillCapture
            key={registeredPatientId}
            patientId={registeredPatientId}
          />
        );
      default:
        return (
          <PatientForm 
            onPatientRegistered={handlePatientRegistered}
            onAttachToPatient={handlePatientAttached}
            availablePatients={availablePatients}
          />
        );
    }
  };

  // If still loading bills, show loading state
  if (billsLoading) {
    return (
      <div className="w-full bg-white border rounded-lg shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="small" />
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white border rounded-lg shadow-sm">
        {/* Tabs Header */}
        <div className="border-b flex space-x-2 overflow-x-auto px-4">
          {tabs.map((tab) => {
            const isPatientTab = tab.key === "patient";
            const isEmergencyTab = tab.key === "emergency";

            const isDisabled =
              (isEmergencyTab && !registeredPatientId) ||
              (isPatientTab && patientLocked);

            return (
              <button
                key={tab.key}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setActiveTab(tab.key);
                }}
                className={`py-3 px-4 text-sm font-medium
        ${
          activeTab === tab.key
            ? "border-b-2 border-green-700 text-green-700"
            : "text-gray-600 hover:text-gray-900"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </>
  );
};

export default EBillCapture;