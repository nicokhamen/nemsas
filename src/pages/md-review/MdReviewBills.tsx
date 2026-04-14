import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { XCircle } from "lucide-react";
import type { RootState } from "../../services/store/store";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { useAppDispatch } from "../../hooks/redux";
import { useCustomToast } from "../../hooks/useCustomToast";
import { fetchEmergencyClaimBillsByClaimNumber } from "../../services/thunks/claimEmergencyThunk";
import { clearCurrentEmergencyBills } from "../../services/slices/claimEmergencyBillsSlice";
import { mdVetEmergencyClaim } from "../../services/thunks/mdRequestThunk";
import type { ClaimEmergencyBill } from "../../types/ClaimEmergencyBills";
import { useProviderContext } from "../../context/useProviderContext";

const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

const formatCurrency = (amount: number): string => {
  return `\u20a6${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString || dateString.startsWith("0001-01-01")) return "N/A";

  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getBillTotal = (bill: ClaimEmergencyBill): number => {
  return (bill.productServices || []).reduce((total, service) => {
    return total + (service.netAmount || service.price * (service.quantity || 1));
  }, 0);
};

const getTariffCode = (bill: ClaimEmergencyBill): string => {
  return (
    bill.productServices?.map((service) => service.code).filter(Boolean)[0] ||
    "N/A"
  );
};

export const MdReviewBills = () => {
  const { id: routeClaimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const toast = useCustomToast();
  const { selectedProviderId } = useProviderContext();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerIdFromLocation = location.state?.providerId;
  const queryClaimNumber = new URLSearchParams(location.search).get("ClaimNumber");
  const claimNumber =
    location.state?.claimNumber || queryClaimNumber || "";

  const {
    data: emergencyBills,
    loading,
    error,
  } = useSelector((state: RootState) => state.claimsEmergencyBills);

  const [mdName, setMdName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const claimDetails = emergencyBills?.claimDetails;
  const bills = emergencyBills?.data || [];
  const claimId = claimDetails?.id || routeClaimId || "";

  const totalAmount = useMemo(() => {
    return bills.reduce((total, bill) => total + getBillTotal(bill), 0);
  }, [bills]);

  const loadEmergencyBills = useCallback(() => {
    if (claimNumber) {
      dispatch(fetchEmergencyClaimBillsByClaimNumber({ claimNumber }));
    }
  }, [dispatch, claimNumber]);

  useEffect(() => {
    if (claimNumber) {
      loadEmergencyBills();
    }

    return () => {
      dispatch(clearCurrentEmergencyBills());
    };
  }, [dispatch, claimNumber, loadEmergencyBills]);

  const handleBack = () => {
    navigate("/md-review");
  };

  const handleRowClick = (bill: ClaimEmergencyBill) => {
    navigate(`/md-review/emergency-bills/${claimId}/${bill.patientId}`, {
      state: {
        patientId: bill.patientId,
        billId: bill.id,
        claimId,
        claimNumber: claimDetails?.claimNumber || claimNumber,
        providerId: bill.providerId || providerId,
        fromMdReview: true,
      },
    });
  };

  const submitReview = async (status: "Approved" | "Rejected") => {
    if (!claimId || bills.length === 0) return;

    if (status === "Approved" && !mdName.trim()) {
      toast.error("Please enter your legal name before approving");
      return;
    }

    setIsProcessing(true);

    try {
      await dispatch(
        mdVetEmergencyClaim({
          claimId,
          emergencyClaimId: claimId,
          emergencyBillIds: bills.map((bill) => bill.id),
          status,
          remark:
            status === "Approved"
              ? `Approved by Medical Director: ${mdName.trim()}`
              : "Rejected by Medical Director",
          isBillOnly: true,
          vettedAmount: totalAmount,
        }),
      ).unwrap();

      toast.success(
        status === "Approved"
          ? "Review approved successfully"
          : "Review rejected successfully",
      );
      loadEmergencyBills();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${status.toLowerCase()} review`;
      toast.error(message);
    } finally {
      setIsProcessing(false);
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
      <div className="mx-auto max-w-5xl bg-white px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 pb-3">
          <h1 className="text-xl font-semibold text-gray-600">
            MD Endorsement
          </h1>
          <button
            onClick={handleBack}
            className="rounded-full text-[#0B4972] transition hover:bg-gray-100"
            title="Close"
          >
            <XCircle className="h-8 w-8" />
          </button>
        </div>

        <div className="py-7">
          <div className="flex flex-wrap items-center gap-5">
            <h2 className="text-2xl font-bold text-gray-900">
              {claimDetails?.claimNumber || claimNumber || "N/A"}
            </h2>
            <span className="rounded-full bg-orange-50 px-5 py-1 text-sm font-medium text-orange-500">
              {claimDetails?.status || "Awaiting Review"}
            </span>
          </div>
          <p className="mt-2 text-gray-800">
            {claimDetails?.description || formatDate(claimDetails?.claimDate)}
          </p>
        </div>

        <div>
          <h3 className="border-b border-gray-300 pb-3 text-lg font-semibold text-red-600">
            All Bills
          </h3>

          {error && (
            <div className="mt-6 border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={loadEmergencyBills}
                  className="rounded-sm text-red-600 hover:text-red-700"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {loading && !emergencyBills ? (
            <div className="flex h-52 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : !claimNumber ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-500">
                Claim number is required to view emergency bills.
              </p>
              <Button onClick={handleBack} className="rounded-sm">
                Back to Claims
              </Button>
            </div>
          ) : bills.length === 0 ? (
            <EmptyState
              icon={<span className="text-2xl">PDF</span>}
              title="No emergency bills available"
              description={
                error ? "Failed to load bills" : "No bills found for this claim."
              }
              action={
                <Button onClick={handleBack} className="rounded-sm">
                  Back to Claims
                </Button>
              }
            />
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#F1FAF7] text-gray-500">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Patient Number</th>
                    <th className="px-4 py-4 font-semibold">Encounter ID</th>
                    <th className="px-4 py-4 font-semibold">Encounter Date</th>
                    <th className="px-4 py-4 font-semibold">Diagnosis</th>
                    <th className="px-4 py-4 font-semibold">Tariff Code</th>
                    <th className="px-4 py-4 font-semibold">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr
                      key={bill.id}
                      onClick={() => handleRowClick(bill)}
                      className="cursor-pointer border-b border-gray-100 text-gray-600 transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        {bill.patient?.hospitalNumber || "N/A"}
                      </td>
                      <td className="px-4 py-4">{bill.encounterId || "N/A"}</td>
                      <td className="px-4 py-4">
                        {formatDate(bill.encounterStartDateTime)}
                      </td>
                      <td
                        className="max-w-[220px] truncate px-4 py-4"
                        title={bill.diagnoses?.[0]?.diagnosis || "N/A"}
                      >
                        {bill.diagnoses?.[0]?.diagnosis || "N/A"}
                      </td>
                      <td className="px-4 py-4">{getTariffCode(bill)}</td>
                      <td className="px-4 py-4">
                        {formatCurrency(getBillTotal(bill))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {bills.length > 0 && (
          <div className="mt-8">
            <h3 className="border-b border-gray-300 pb-3 text-lg font-semibold text-red-600">
              Signature
            </h3>
            <p className="mt-4 text-base font-semibold text-gray-900">
              To approve, add your signature in the box below and your legal name
            </p>

            <div className="mt-4 grid grid-cols-1 items-end gap-8 md:grid-cols-[1fr_1fr]">
              <div className="h-28 bg-gray-100" />
              <input
                value={mdName}
                onChange={(event) => setMdName(event.target.value)}
                placeholder="Type your name here"
                className="border-0 border-b border-gray-300 px-1 py-3 italic text-gray-700 outline-none focus:border-red-500 focus:ring-0"
              />
            </div>

            <div className="mt-9 flex gap-5">
              <button
                onClick={() => submitReview("Approved")}
                disabled={isProcessing}
                className="rounded-sm bg-green-600 px-10 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => submitReview("Rejected")}
                disabled={isProcessing}
                className="rounded-sm border border-red-500 bg-red-100 px-10 py-4 font-semibold text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MdReviewBills;
