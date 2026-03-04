// pages/EmergencyClaims/PatientEncounterDetails.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAppDispatch } from "../../../hooks/redux";
import type { RootState } from "../../../services/store/store";
import { fetchPatientEncounter } from "../../../services/thunks/patientEncounterThunk";
import { clearPatientEncounter } from "../../../services/slices/patientEncounterSlice";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";
import type { EmergencyBill } from "../../../types/PatientsEncounter";

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PatientEncounterDetails: React.FC = () => {
  const { claimId, patientId } = useParams<{ claimId: string; patientId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get providerId from auth context
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerId = currentUser?.providerId || "";

  // Get patient encounter data from Redux store
  const {
    data: encounters,
    loading,
    error,
  } = useSelector((state: RootState) => state.patientEncounter);

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Load patient encounters when component mounts
  useEffect(() => {
    if (patientId && providerId) {
      dispatch(fetchPatientEncounter({ patientId, providerId }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearPatientEncounter());
    };
  }, [dispatch, patientId, providerId]);

  // Get the patient details from the first encounter (if available)
  const patientDetails = encounters && encounters.length > 0 ? encounters[0].patient : null;

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (patientId && providerId) {
      dispatch(fetchPatientEncounter({ patientId, providerId }));
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-lg font-semibold text-gray-500">Bill - Details</h2>
      </div>

      <hr className="pb-1 pt-2" />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {/* No data state */}
      {!loading && !error && (!encounters || encounters.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">No encounter data available for this patient.</p>
          <Button onClick={handleBack}>Back to Claims</Button>
        </div>
      )}

      {/* Patient Details Section */}
      {patientDetails && (
        <div className="bg-gray-100 p-6 rounded-md">
          <h2 className="text-red-600 font-semibold text-lg mb-4">
            Patient Details
          </h2>
          <hr className="pb-4 pt-2" />

          <div className="grid grid-cols-2 gap-x-20 gap-y-6 text-sm">
            {/* Left Column */}
            <div className="space-y-6">
              <DetailRow 
                label="Patient Number" 
                value={patientDetails.hospitalNumber || 'N/A'} 
              />
              <DetailRow 
                label="Phone number" 
                value={patientDetails.phoneNumber || 'N/A'} 
              />
              <DetailRow 
                label="Hospital Name" 
                value={encounters?.[0]?.hospitalName || 'N/A'} 
              />
              <DetailRow
                label="Address"
                value={patientDetails.address || 'N/A'}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <DetailRow 
                label="Gender" 
                value={patientDetails.gender || 'N/A'} 
              />
              <DetailRow 
                label="Insurance" 
                value={patientDetails.insuranceStatus || 'N/A'} 
              />
              <DetailRow 
                label="Email" 
                value={patientDetails.email || 'N/A'} 
              />
              <DetailRow 
                label="Patient Name" 
                value={`${patientDetails.firstName || ''} ${patientDetails.lastName || ''}`.trim() || 'N/A'} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Encounters Section */}
      {encounters && encounters.length > 0 && (
        <div>
          <h2 className="text-red-600 font-semibold mb-4">Encounters</h2>

          <div className="space-y-4">
            {encounters.map((encounter: EmergencyBill, index: number) => {
              const isOpen = openIndex === index;

              return (
                <div key={encounter.id || index} className="bg-white rounded-lg shadow-sm border">
                  {/* Header */}
                  <div
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {encounter.status?.toLowerCase() === "closed" ? (
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                      ) : (
                        <AlertCircle className="text-orange-500 w-5 h-5" />
                      )}

                      <span className="font-medium text-gray-700">
                        {encounter.encounterId || `Encounter ${index + 1}`}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  {isOpen && (
                    <div className="border-t px-6 py-4 text-sm text-gray-600">
                      {/* Encounter Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p>
                            <span className="font-medium">Encounter Date:</span>{" "}
                            {formatDate(encounter.encounterStartDateTime)}
                          </p>
                          <p>
                            <span className="font-medium">Department:</span>{" "}
                            {encounter.department || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Ward/Unit:</span>{" "}
                            {encounter.serviceCategories?.join(', ') || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p>
                            <span className="font-medium">Service Type:</span>{" "}
                            {encounter.serviceType || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Discharge Status:</span>{" "}
                            {encounter.dischargeStatus || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Attending Physician:</span>{" "}
                            {encounter.attendingPhysician || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Diagnoses Section */}
                      {encounter.diagnoses && encounter.diagnoses.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium text-gray-700 mb-2">Diagnoses</h3>
                          <div className="space-y-2">
                            {encounter.diagnoses.map((diagnosis, idx) => (
                              <div key={diagnosis.id || idx} className="bg-gray-50 p-3 rounded">
                                <p><span className="font-medium">Diagnosis:</span> {diagnosis.diagnosis}</p>
                                <p><span className="font-medium">Code:</span> {diagnosis.code}</p>
                                {diagnosis.note && <p><span className="font-medium">Note:</span> {diagnosis.note}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products/Services Section */}
                      {encounter.productServices && encounter.productServices.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium text-gray-700 mb-2">Services/Products</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {encounter.productServices.map((item, idx) => (
                                  <tr key={item.id || idx}>
                                    <td className="px-4 py-2 text-sm">{item.name}</td>
                                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm">₦{item.price?.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-sm font-medium">₦{item.netAmount?.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= Reusable Detail Item ================= */
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-700 text-right max-w-[60%] break-words">
      {value}
    </span>
  </div>
);

export default PatientEncounterDetails;