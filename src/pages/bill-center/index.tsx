import React, { useState, useEffect } from "react";
import PatientForm from "./PatientForm";
import EmergencyBillCapture from "./EmergencyBillCapture";

const tabs = [
  { key: "patient", label: "Patient Record" },
  { key: "emergency", label: "Emergency Bill" },
];

const EBillCapture: React.FC = () => {
  const [activeTab, setActiveTab] = useState("patient");
  const [registeredPatientId, setRegisteredPatientId] = useState<string>("");
  const [patientLocked, setPatientLocked] = useState(false);

  // Add a useEffect to debug the state
  useEffect(() => {
    console.log("EBillCapture - Current state:", {
      activeTab,
      registeredPatientId,
      hasPatientId: !!registeredPatientId,
    });
  }, [activeTab, registeredPatientId]);

  const handlePatientRegistered = (patientId: string) => {
    console.log("handlePatientRegistered called with:", patientId);
    setRegisteredPatientId(patientId);
    setPatientLocked(true);
    setActiveTab("emergency");
  };

  const renderContent = () => {
    console.log("renderContent - activeTab:", activeTab);

    switch (activeTab) {
      case "patient":
        return <PatientForm onPatientRegistered={handlePatientRegistered} />;
      case "emergency":
        return (
          <EmergencyBillCapture
            key={registeredPatientId}
            patientId={registeredPatientId}
          />
        );
      default:
        return <PatientForm onPatientRegistered={handlePatientRegistered} />;
    }
  };

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
