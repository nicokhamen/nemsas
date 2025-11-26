import React, { useState } from 'react';
import PatientForm from './PatientForm';
import EmergencyBillCapture from './EmergencyBillCapture';

const tabs = [
  { key: "patient", label: "Patient Record" },
  { key: "Emergency", label: "Emergency Bill" },
];

const EBillCapture: React.FC = () => {
  const [activeTab, setActiveTab] = useState("patient");

  const handlePatientRegistered = () => {
    setActiveTab("Emergency");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'patient':
        return <PatientForm onPatientRegistered={handlePatientRegistered} />;
      case 'Emergency':
        return <EmergencyBillCapture />;     
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
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
};

export default EBillCapture;