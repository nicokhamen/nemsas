import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useAppDispatch } from "../../../hooks/redux";
import type { RootState } from "../../../services/store/store";
import { fetchPatientEncounter } from "../../../services/thunks/patientEncounterThunk";
import { clearPatientEncounter } from "../../../services/slices/patientEncounterSlice";
import { mdVetEmergencyClaim } from "../../../services/thunks/mdRequestThunk";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";
import type { EmergencyBill } from "../../../types/PatientsEncounter";
import { useProviderContext } from "../../../context/useProviderContext";
import { useCustomToast } from "../../../hooks/useCustomToast";

const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return "-";

  return `\u20a6${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getFileName = (path: string): string => path.split("/").pop() || path;

const getEncounterTotal = (encounter?: EmergencyBill | null): number => {
  if (!encounter) return 0;

  return (
    encounter.totalAmount ??
    encounter.productServices?.reduce((sum, item) => {
      const itemTotal =
        item.netAmount ?? (item.price || 0) * (item.quantity || 0);

      return sum + itemTotal;
    }, 0) ??
    0
  );
};

const statusClass = (status?: string): string => {
  const normalized = status?.toLowerCase();

  if (normalized === "approved") return "bg-green-100 text-green-700";
  if (normalized === "rejected") return "bg-red-100 text-red-700";
  if (normalized === "disputed") return "bg-amber-100 text-amber-700";

  return "bg-orange-50 text-orange-500";
};

const PatientEncounterDetails: React.FC = () => {
  const { claimId, patientId } = useParams<{
    claimId: string;
    patientId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { selectedProviderId } = useProviderContext();
  const toast = useCustomToast();

  const claimNumber = location.state?.claimNumber;
  const billId = location.state?.billId;
  const hospitalNumberFromLocation = location.state?.hospitalNumber;
  const descriptionFromLocation = location.state?.description;
  const providerIdFromLocation = location.state?.providerId;
  const fromMdReview = location.state?.fromMdReview;
  const isMdReviewDetail =
    Boolean(fromMdReview) ||
    location.pathname.includes("/md-review/") ||
    location.pathname.includes("/md/review/");

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerId = useMemo(() => {
    if (currentUser?.orgType === "PROVIDER") {
      return currentUser.providerId || "";
    }

    if (selectedProviderId && selectedProviderId !== ZERO_GUID) {
      return selectedProviderId;
    }

    if (providerIdFromLocation && providerIdFromLocation !== ZERO_GUID) {
      return providerIdFromLocation;
    }

    return currentUser?.providerId || "";
  }, [currentUser, selectedProviderId, providerIdFromLocation]);

  const {
    data: encounters,
    loading,
    error,
  } = useSelector((state: RootState) => state.patientEncounter);

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedActionEncounter, setSelectedActionEncounter] =
    useState<EmergencyBill | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "Approved" | "Rejected" | null
  >(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (patientId && providerId) {
      dispatch(
        fetchPatientEncounter({
          patientId,
          providerId,
          emergencyClaimId: claimId,
          hospitalNumber: hospitalNumberFromLocation,
        }),
      );
    }

    return () => {
      dispatch(clearPatientEncounter());
    };
  }, [dispatch, patientId, providerId, claimId, hospitalNumberFromLocation]);

  useEffect(() => {
    if (!billId || !encounters?.length) return;

    const selectedIndex = encounters.findIndex(
      (encounter) => encounter.id === billId,
    );

    if (selectedIndex >= 0) {
      setOpenIndex(selectedIndex);
    }
  }, [billId, encounters]);

  const patientDetails = encounters?.[0]?.patient || null;

  const selectedEncounter = useMemo(() => {
    if (!encounters?.length) return null;

    if (openIndex !== null && encounters[openIndex]) {
      return encounters[openIndex];
    }

    return encounters[0];
  }, [encounters, openIndex]);

  const diagnosis = selectedEncounter?.diagnoses?.[0];

  const handleBack = () => {
    if (fromMdReview && claimId) {
      navigate(`/md-review/${claimId}`, {
        state: {
          claimNumber,
          description: descriptionFromLocation,
          claimId,
          providerId,
          fromMdReview: true,
        },
      });
      return;
    }

    navigate(-1);
  };

  const handleRefresh = () => {
    if (patientId && providerId) {
      dispatch(
        fetchPatientEncounter({
          patientId,
          providerId,
          emergencyClaimId: claimId,
          hospitalNumber: hospitalNumberFromLocation,
        }),
      );
    }
  };

  const requestBillAction = (
    action: "Approved" | "Rejected",
    encounter: EmergencyBill,
  ) => {
    setSelectedActionEncounter(encounter);
    setPendingAction(action);
  };

  const closeActionModal = () => {
    setPendingAction(null);
    setSelectedActionEncounter(null);
  };

  const confirmBillAction = async () => {
    if (!claimId || !pendingAction || !selectedActionEncounter?.id) {
      toast.error("Unable to identify the bill for this action.");
      return;
    }

    try {
      setIsActionLoading(true);

      await dispatch(
        mdVetEmergencyClaim({
          claimId,
          emergencyClaimId: claimId,
          emergencyBillIds: [selectedActionEncounter.id],
          status: pendingAction,
          remark:
            pendingAction === "Approved"
              ? "Approved by Medical Director"
              : "Rejected by Medical Director",
          isBillOnly: true,
          vettedAmount: getEncounterTotal(selectedActionEncounter),
        }),
      ).unwrap();

      toast.success(
        pendingAction === "Approved"
          ? "Bill approved successfully"
          : "Bill rejected successfully",
      );
      closeActionModal();
      handleRefresh();
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Unable to complete bill action",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-600">Bill Details</h1>
          <button
            onClick={handleBack}
            className="rounded-full text-[#0B4972] transition hover:bg-gray-100"
            title="Close"
          >
            <XCircle className="h-9 w-9" />
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              {claimNumber || claimId || "N/A"}
            </h2>
            <span
              className={`rounded-full px-5 py-1 text-sm font-medium ${statusClass(
                selectedEncounter?.status,
              )}`}
            >
              {selectedEncounter?.status || "Awaiting Review"}
            </span>
          </div>
          <p className="mt-2 text-base text-gray-800">
            {formatDate(selectedEncounter?.encounterStartDateTime)}
          </p>
        </div>

        {error && (
          <div className="mx-8 mb-6 border-l-4 border-red-500 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!loading && !error && !encounters?.length && (
          <div className="mx-8 mb-8 bg-gray-50 py-12 text-center">
            <p className="mb-4 text-gray-500">
              No encounter data available for this patient.
            </p>
            <Button onClick={handleBack}>Back to Claims</Button>
          </div>
        )}

        {!loading && patientDetails && selectedEncounter && (
          <div className="space-y-8 px-8 pb-10">
            <SectionTitle>Patient Details</SectionTitle>
            <div className="grid gap-x-24 gap-y-7 md:grid-cols-2">
              <DetailRow
                label="Patient Number"
                value={patientDetails.hospitalNumber || "N/A"}
              />
              <DetailRow label="Gender" value={patientDetails.gender || "N/A"} />
              <DetailRow
                label="Phone number"
                value={patientDetails.phoneNumber || "N/A"}
              />
              <DetailRow
                label="Insurance"
                value={patientDetails.insuranceStatus || "N/A"}
              />
              <DetailRow
                label="Hospital Name"
                value={selectedEncounter.hospitalName || "N/A"}
              />
              <DetailRow label="Email" value={patientDetails.email || "N/A"} />
              <DetailRow
                label="Address"
                value={patientDetails.address || "N/A"}
              />
              <DetailRow
                label="Patient Name"
                value={
                  `${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() ||
                  "N/A"
                }
              />
            </div>

            <SectionTitle>Encounters</SectionTitle>
            <div className="space-y-4">
              {encounters?.map((encounter: EmergencyBill, index: number) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={encounter.id || index}
                    className="overflow-hidden rounded-md border border-gray-200 bg-white"
                  >
                    <div
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex cursor-pointer items-center justify-between px-8 py-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">
                          EncounterID {encounter.encounterId || `00${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isMdReviewDetail && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                requestBillAction("Approved", encounter);
                              }}
                              className="rounded px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                              style={{ backgroundColor: "#22A857" }}
                              disabled={isActionLoading}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                requestBillAction("Rejected", encounter);
                              }}
                              className="rounded border border-red-400 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isActionLoading}
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-900" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-900" />
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-200 px-8 py-7">
                        <div className="grid grid-cols-1 gap-x-16 gap-y-3 md:grid-cols-2">
                          <DetailRow
                            label="Encounter Date:"
                            value={formatDate(encounter.encounterStartDateTime)}
                          />
                          <DetailRow
                            label="Emergency Type:"
                            value={encounter.serviceType || "N/A"}
                          />
                          <DetailRow
                            label="Ward/Unit:"
                            value={
                              encounter.serviceCategories?.join(", ") ||
                              encounter.department ||
                              "N/A"
                            }
                          />
                          <DetailRow
                            label="Comment:"
                            value={encounter.attendingPhysician || "..."}
                          />
                          <span
                            className={`mt-4 w-fit rounded-full px-4 py-1 text-sm font-medium ${statusClass(
                              encounter.status,
                            )}`}
                          >
                            {encounter.status || "Awaiting Review"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <SectionTitle>Diagnosis</SectionTitle>
            <div className="grid gap-x-24 gap-y-7 md:grid-cols-2">
              <DetailRow
                label="Diagnosis"
                value={diagnosis?.diagnosis || "N/A"}
              />
              <DetailRow label="Type" value={diagnosis?.type || "N/A"} />
              <DetailRow label="Code" value={diagnosis?.code || "N/A"} />
              <DetailRow label="Note" value={diagnosis?.note || "No comment..."} />
            </div>

            <SectionTitle>Emergency History</SectionTitle>
            <div className="grid gap-x-24 gap-y-5 md:grid-cols-2">
              {[
                "Road traffic accidents",
                "Obstetric & gynecologic emergencies",
                "Trauma and Injuries",
                "Pediatric emergency",
                "Medical emergencies",
                "Assault Cases",
                "Other",
              ].map((label) => (
                <CheckboxLine
                  key={label}
                  label={label}
                  checked={
                    selectedEncounter.serviceCategories?.some((category) =>
                      category.toLowerCase().includes(label.toLowerCase()),
                    ) ||
                    selectedEncounter.serviceType
                      ?.toLowerCase()
                      .includes(label.toLowerCase()) ||
                    false
                  }
                />
              ))}
            </div>

            <SectionTitle>Uploaded Documents</SectionTitle>
            {selectedEncounter.supportingDocuments?.length ? (
              <div className="grid gap-x-20 md:grid-cols-2">
                {selectedEncounter.supportingDocuments.map((documentUrl, idx) => (
                  <a
                    key={`${documentUrl}-${idx}`}
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-gray-100 py-4 text-gray-600 hover:text-red-600"
                  >
                    {getFileName(documentUrl)}
                  </a>
                ))}
              </div>
            ) : (
              <p className="py-4 text-gray-500">No uploaded documents available.</p>
            )}

            <SectionTitle>Product/Service</SectionTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F1FAF7] text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">
                      Service Description
                    </th>
                    <th className="px-6 py-4 font-semibold">Qty</th>
                    <th className="px-6 py-4 font-semibold">Unit Price</th>
                    <th className="px-6 py-4 font-semibold">NHIS Price</th>
                    <th className="px-6 py-4 font-semibold">NHIS (%)</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEncounter.productServices?.length ? (
                    selectedEncounter.productServices.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-gray-100">
                        <td className="px-6 py-4 text-gray-600">
                          <CheckboxLine label={item.name || "N/A"} />
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.description || item.code || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.quantity || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatCurrency(item.nhisPrice)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.nhisPercentage ?? "-"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-700">
                          {formatCurrency(item.netAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No product or service items available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <BillActionModal
        action={pendingAction}
        isOpen={Boolean(pendingAction)}
        isLoading={isActionLoading}
        onClose={closeActionModal}
        onConfirm={confirmBillAction}
      />
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="grid grid-cols-[minmax(120px,1fr)_minmax(140px,1.25fr)] items-start gap-6">
    <span className="text-base text-gray-500">{label}</span>
    <span className="break-words text-base font-semibold text-gray-700">
      {value}
    </span>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-b border-gray-300 pb-3">
    <h2 className="text-xl font-semibold text-red-600">{children}</h2>
  </div>
);

const CheckboxLine: React.FC<{ label: string; checked?: boolean }> = ({
  label,
  checked = false,
}) => (
  <span className="flex items-center gap-3 text-gray-800">
    <span
      className={`h-4 w-4 shrink-0 border border-emerald-800 ${
        checked ? "bg-emerald-700" : "bg-white"
      }`}
    />
    <span>{label}</span>
  </span>
);

interface BillActionModalProps {
  action: "Approved" | "Rejected" | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BillActionModal: React.FC<BillActionModalProps> = ({
  action,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !action) return null;

  const isApprove = action === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md rounded bg-white px-10 py-9 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-gray-500 hover:bg-gray-50"
          disabled={isLoading}
          aria-label="Close"
        >
          x
        </button>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-2xl leading-none text-white">
            x
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-2 text-xl font-medium text-gray-800">Oh Wait!</h3>
          <p className="mx-auto max-w-xs text-sm leading-6 text-gray-700">
            You are about to {isApprove ? "approve" : "reject"} this bill, this
            action is permanent. Do you still wish to continue?
          </p>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-500 bg-white px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            No, cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              isApprove
                ? "bg-[#22A857] hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : isApprove
                ? "Yes, Approve"
                : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientEncounterDetails;
