// To toggle both form components - EmergencyBillCapture and Patient form
import React, { useState, useEffect } from 'react';
import PatientForm from './PatientForm';
import EmergencyBillCapture from './EmergencyBillCapture';

const tabs = [
  { key: "patient", label: "Patient Record" },
  { key: "emergency", label: "Emergency Bill" },
];

const EBillCapture: React.FC = () => {
  const [activeTab, setActiveTab] = useState("patient");
  const [registeredPatientId, setRegisteredPatientId] = useState<string>(""); 
  
  // Add a useEffect to debug the state
  useEffect(() => {
    console.log("EBillCapture - Current state:", { 
      activeTab, 
      registeredPatientId,
      hasPatientId: !!registeredPatientId 
    });
  }, [activeTab, registeredPatientId]);

  const handlePatientRegistered = (patientId: string) => { 
    console.log("handlePatientRegistered called with:", patientId);
    setRegisteredPatientId(patientId);
    setActiveTab("emergency");
  };

  const renderContent = () => {
    console.log("renderContent - activeTab:", activeTab);
    
    switch (activeTab) {
      case 'patient':
        return <PatientForm onPatientRegistered={handlePatientRegistered} />;
      case 'emergency':
        return<EmergencyBillCapture key={registeredPatientId} patientId={registeredPatientId} />
      default:
        return <PatientForm onPatientRegistered={handlePatientRegistered} />;
    }
  };

  return (
    <div className="w-full bg-white border rounded-lg shadow-sm">
      {/* Tabs Header */}
      <div className="border-b flex space-x-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-green-700 text-green-700 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => {
              console.log(`Tab clicked: ${tab.key}, has patientId: ${!!registeredPatientId}`);
              // Prevent switching to Emergency tab if no patient is registered
              if (tab.key === "emergency" && !registeredPatientId) {
                alert("Please register a patient first");
                return;
              }
              setActiveTab(tab.key);
            }}
            disabled={tab.key === "emergency" && !registeredPatientId} 
          >
            {tab.label}
            {tab.key === "emergency" && !registeredPatientId }
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
};

export default EBillCapture;