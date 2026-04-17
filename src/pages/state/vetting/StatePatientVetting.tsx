import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import FormHeader from "../../../components/form/FormHeader";
import { useProviderContext } from "../../../context/useProviderContext";
import DisputeVettingModal from "../../../components/ui/DisputeVettingModal";
import RejectVettingModal from "../../../components/ui/RejectVettingModal";
import { disputeRejectBill } from "../../../services/thunks/vettiingBillThunk";
import { useCustomToast } from "../../../hooks/useCustomToast";

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

const StatePatientVetting: React.FC = () => {
  // Get parameters from URL: /state/emergency-bills/:claimId/:patientId
  const { claimId, patientId } = useParams<{
    claimId: string;
    patientId: string;
  }>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const toast = useCustomToast();

  // Get data from location state (UI CONVENIENCE ONLY - NOT PRIMARY SOURCE)
  const claimNumberFromLocation = location.state?.claimNumber;
  const fromEmergencyClaims = location.state?.fromEmergencyClaims;
  const fromMdReview = location.state?.fromMdReview;

  // dispute and reject modals
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] =
    useState<EmergencyBill | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  
  // Track which bills have been disputed/rejected
  const [disputedBills, setDisputedBills] = useState<Set<string>>(new Set());
  const [rejectedBills, setRejectedBills] = useState<Set<string>>(new Set());
  const [processingBillId, setProcessingBillId] = useState<string | null>(null);

  // Get current user from auth
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Get selected provider from context (PRIMARY SOURCE)
  const { selectedProviderId, setSelectedProviderId } = useProviderContext();

  /**
   * RESOLUTION ORDER (Priority Chain):
   * 1. ProviderContext.selectedProviderId (PRIMARY SOURCE)
   * 2. Redux currentUser.providerId (for provider users)
   * 3. EMPTY (NEVER ALLOW API CALL WITH INVALID ID)
   *
   * REMOVED: location.state?.providerId as primary source
   */
  const providerId = useMemo(() => {
    // For provider users, they can only see their own data
    if (currentUser?.orgType === "Provider") {
      const providerIdValue = currentUser.providerId || "";
      return providerIdValue;
    }

    // For SSHIA users, use ProviderContext (user-selected from dropdown)
    if (
      selectedProviderId &&
      selectedProviderId !== "00000000-0000-0000-0000-000000000000"
    ) {
      return selectedProviderId;
    }

    // Final fallback to user's providerId (for admin users)
    const userProviderId = currentUser?.providerId || "";
    if (
      userProviderId &&
      userProviderId !== "00000000-0000-0000-0000-000000000000"
    ) {
      return userProviderId;
    }

    // NO VALID PROVIDER ID - BLOCK API CALLS
    return "";
  }, [currentUser, selectedProviderId]);

  // SAFETY SYNC: Update context when providerId resolves
  useEffect(() => {
    if (providerId && providerId !== "00000000-0000-0000-0000-000000000000") {
      // Only update if context doesn't already have this value or is different
      if (selectedProviderId !== providerId) {
        setSelectedProviderId(providerId);
      }
    }
  }, [providerId, selectedProviderId, setSelectedProviderId]);

  // Get patient encounter data from Redux store
  const {
    data: encounters,
    loading,
    error,
  } = useSelector((state: RootState) => state.patientEncounter);

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Initialize disputed/rejected sets from existing encounter statuses
  useEffect(() => {
    if (encounters && encounters.length > 0) {
      const disputed = new Set<string>();
      const rejected = new Set<string>();
      
      encounters.forEach(encounter => {
        if (encounter.status === "Disputed") {
          disputed.add(encounter.id);
        } else if (encounter.status === "Rejected") {
          rejected.add(encounter.id);
        }
      });
      
      setDisputedBills(disputed);
      setRejectedBills(rejected);
    }
  }, [encounters]);

  // Load patient encounters with SAFE API CALL - BLOCK INVALID PROVIDER IDS
  useEffect(() => {
    // BLOCK API CALL if required params are missing
    if (!patientId || !providerId) {
      return;
    }

    // BLOCK API CALL if providerId is all zeros (invalid)
    if (providerId === "00000000-0000-0000-0000-000000000000") {
      return;
    }

    dispatch(fetchPatientEncounter({ patientId, providerId }));

    // Cleanup on unmount
    return () => {
      dispatch(clearPatientEncounter());
    };
  }, [dispatch, patientId, providerId]);

  // Get the patient details from the first encounter (if available)
  const patientDetails =
    encounters && encounters.length > 0 ? encounters[0].patient : null;

  // Handle back navigation - go back to the bills page
  const handleBack = () => {
    if (fromMdReview && claimId) {
      navigate(`/md-review/${claimId}`, {
        state: {
          claimNumber: claimNumberFromLocation,
          claimId: claimId,
          fromMdReview: true,
        },
      });
      return;
    }

    if (fromEmergencyClaims && claimId) {
      navigate(`/state/emergency/claims/${claimId}`, {
        state: {
          claimNumber: claimNumberFromLocation,
          // Do NOT pass providerId in state - will be resolved by context
          claimId: claimId,
        },
      });
    } else {
      navigate(-1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (
      patientId &&
      providerId &&
      providerId !== "00000000-0000-0000-0000-000000000000"
    ) {
      dispatch(fetchPatientEncounter({ patientId, providerId }));
    }
  };

  // Reject and dispute bills

  const handleRejectBill = async () => {
    if (!selectedEncounter?.id) return;

    setProcessingBillId(selectedEncounter.id);
    
    try {
      await dispatch(
        disputeRejectBill({
          emergencyBillId: selectedEncounter.id,
          providerId: providerId,
          remark: "Invalid bill",
          status: "Rejected",
        }),
      ).unwrap();

      // Add to rejected set
      setRejectedBills(prev => new Set(prev).add(selectedEncounter.id));
      // Remove from disputed set if it was there
      setDisputedBills(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedEncounter.id);
        return newSet;
      });
      
      toast.error("Bill rejected");
      setIsRejectModalOpen(false);
    } catch (error) {
      toast.error("Failed to reject bill");
    } finally {
      setProcessingBillId(null);
    }
  };

  const handleDisputeBill = async (reason: string) => {
    console.log(selectedEncounter);
    if (!selectedEncounter?.id) return;

    setProcessingBillId(selectedEncounter.id);
    
    try {
      await dispatch(
        disputeRejectBill({
          emergencyBillId: selectedEncounter.id,
          providerId: providerId,
          remark: reason,
          status: "Disputed",
        }),
      ).unwrap();

      // Add to disputed set
      setDisputedBills(prev => new Set(prev).add(selectedEncounter.id));
      // Remove from rejected set if it was there
      setRejectedBills(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedEncounter.id);
        return newSet;
      });
      
      toast.info("Bill has been activated for dispute");
      setIsDisputeModalOpen(false);
    } catch (error) {
      toast.error("Failed to dispute bill");
    } finally {
      setProcessingBillId(null);
    }
  };
  // ------------------------------------------------------

  // Check if providerId is valid
  const isValidProviderId =
    providerId && providerId !== "00000000-0000-0000-0000-000000000000";

  if (!currentUser && !providerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header with back button */}
        <div className="mb-4">
          {/* Top row */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <FormHeader>Patient Encounter Details</FormHeader>
          </div>

          {/* Bottom row - Claim Info */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-red-700">Claim ID :</span>
            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded">
              {claimNumberFromLocation || claimId || "N/A"}
            </span>
            {/* Provider ID display removed - not needed for UI */}
          </div>
        </div>

        <hr className="pb-1 pt-2" />

        {/* Warning for invalid provider ID */}
        {!isValidProviderId && providerId && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-yellow-700">
                ⚠️ Invalid Provider ID. Please go back and select a valid
                provider.
              </p>
              <Button onClick={handleBack} variant="outline" size="sm">
                Go Back
              </Button>
            </div>
          </div>
        )}

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
        {!loading &&
          !error &&
          (!encounters || encounters.length === 0) &&
          isValidProviderId && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 mb-4">
                No encounter data available for this patient.
              </p>
              <Button onClick={handleBack}>Back to Bills</Button>
            </div>
          )}

        {/* Patient Details Section - Table Layout */}
        {patientDetails && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-white-600 px-6 py-4">
              <h2 className="text-black font-semibold text-lg">
                Patient Details
              </h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 pr-6 w-1/3">
                      <span className="text-gray-600 font-medium">
                        Patient Number
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.hospitalNumber || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 pr-6 w-1/3">
                      <span className="text-gray-600 font-medium">Gender</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.gender || "N/A"}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 pr-6">
                      <span className="text-gray-600 font-medium">
                        Phone Number
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.phoneNumber || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span className="text-gray-600 font-medium">
                        Insurance
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.insuranceStatus || "N/A"}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 pr-6">
                      <span className="text-gray-600 font-medium">
                        Hospital Name
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {encounters?.[0]?.hospitalName || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span className="text-gray-600 font-medium">Email</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.email || "N/A"}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 pr-6 w-1/4">
                      <span className="text-gray-600 font-medium">Address</span>
                    </td>
                    <td className="py-4 w-1/4">
                      <span className="text-gray-900 font-semibold">
                        {patientDetails.address || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 pr-6 w-1/4">
                      <span className="text-gray-600 font-medium">
                        Patient Name
                      </span>
                    </td>
                    <td className="py-4 w-1/4">
                      <span className="text-gray-900 font-semibold">
                        {`${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() ||
                          "N/A"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                const isDisputed = disputedBills.has(encounter.id);
                const isRejected = rejectedBills.has(encounter.id);
                const isProcessing = processingBillId === encounter.id;
                const isDisabled = isDisputed || isRejected || isProcessing;

                return (
                  <div
                    key={encounter.id || index}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                  >
                    {/* Header */}
                    <div
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 border-b"
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

                      <div className="flex items-center gap-3">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* Dispute Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) {
                                setSelectedEncounter(encounter);
                                setIsDisputeModalOpen(true);
                              }
                            }}
                            disabled={isDisabled}
                            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                              isDisputed
                                ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                                : isProcessing
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                                : "text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {isDisputed ? "Disputed" : "Dispute"}
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) {
                                setSelectedEncounter(encounter);
                                setIsRejectModalOpen(true);
                              }
                            }}
                            disabled={isDisabled}
                            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                              isRejected
                                ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                                : isProcessing
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                                : "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {isRejected ? "Rejected" : "Reject"}
                          </button>
                        </div>

                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {isOpen && (
                      <div className="px-6 py-4 text-sm text-gray-600">
                        {/* Encounter Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium">
                                Encounter Date:
                              </span>{" "}
                              {formatDate(encounter.encounterStartDateTime)}
                            </p>
                            <p>
                              <span className="font-medium">Department:</span>{" "}
                              {encounter.department || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Ward/Unit:</span>{" "}
                              {encounter.serviceCategories?.join(", ") || "N/A"}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p>
                              <span className="font-medium">Service Type:</span>{" "}
                              {encounter.serviceType || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Discharge Status:
                              </span>{" "}
                              {encounter.dischargeStatus || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Attending Physician:
                              </span>{" "}
                              {encounter.attendingPhysician || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Diagnoses Section */}
                        {encounter.diagnoses &&
                          encounter.diagnoses.length > 0 && (
                            <div className="mt-4">
                              <h3 className="font-medium text-gray-700 mb-3">
                                Diagnoses
                              </h3>
                              <div className="space-y-2">
                                {encounter.diagnoses.map((diagnosis, idx) => (
                                  <div
                                    key={diagnosis.id || idx}
                                    className="bg-gray-50 p-3 rounded border border-gray-200"
                                  >
                                    <p className="mb-1">
                                      <span className="font-medium">
                                        Diagnosis:
                                      </span>{" "}
                                      {diagnosis.diagnosis}
                                    </p>
                                    <p className="mb-1">
                                      <span className="font-medium">Code:</span>{" "}
                                      {diagnosis.code}
                                    </p>
                                    {diagnosis.note && (
                                      <p>
                                        <span className="font-medium">
                                          Note:
                                        </span>{" "}
                                        {diagnosis.note}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Products/Services Section */}
                        {encounter.productServices &&
                          encounter.productServices.length > 0 && (
                            <div className="mt-4">
                              <h3 className="font-medium text-gray-700 mb-3">
                                Services/Products
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Item
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Quantity
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Price
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Net Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {encounter.productServices.map(
                                      (item, idx) => (
                                        <tr
                                          key={item.id || idx}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 text-sm">
                                            {item.name}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {item.quantity}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            ₦{item.price?.toLocaleString()}
                                          </td>
                                          <td className="px-4 py-3 text-sm font-medium">
                                            ₦{item.netAmount?.toLocaleString()}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                  {encounter.totalAmount && (
                                    <tfoot className="bg-gray-50 border-t">
                                      <tr>
                                        <td
                                          colSpan={3}
                                          className="px-4 py-3 text-right font-medium"
                                        >
                                          Total:
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-green-600">
                                          ₦
                                          {encounter.totalAmount.toLocaleString()}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  )}
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
      <RejectVettingModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectBill}
        isLoading={processingBillId !== null}
      />
      <DisputeVettingModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSubmit={async (reason) => {
          await handleDisputeBill(reason);
        }}
        isLoading={processingBillId !== null}
      />
    </>
  );
};

export default StatePatientVetting;