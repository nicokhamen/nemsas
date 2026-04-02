import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../services/store/store";
// import { fetchEmergencyClaimDetail, clearEmergencyClaimDetail } from "../../features/emergencyClaimDetail/emergencyClaimDetailThunks";
// import { clearError } from "../../features/emergencyClaimDetail/emergencyClaimDetailSlice";
import ButtonG from "../../components/form/ButtonG";
import ButtonT from "../../components/form/ButttonT";
import FormHeader from "../../components/form/FormHeader";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { format } from "date-fns";
import { fetchEmergencyClaimDetail } from "../../services/thunks/emergencyClaimDetailThunk";
import { clearEmergencyClaimDetail } from "../../services/slices/emergencyClaimDetailSlice";
import { clearError } from "../../services/slices/claimDetailSlice";
import { formatDate } from "../../utils/dateFormatter";

export default function EndorsementReview() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get emergency claim details from Redux store
  const { 
    claim, 
    loading, 
    error, 
    successMessage,
    isSuccess 
  } = useSelector((state: RootState) => state.emergencyClaimDetail);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmergencyClaimDetail({ id }));
    }

    return () => {
      dispatch(clearEmergencyClaimDetail());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  // Format claim type for display
  const formatClaimType = (claimType: string): string => {
    // Convert camelCase to readable format
    return claimType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Get status badge color and text
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      Pending: { text: "Pending Review", color: "text-yellow-700", bgColor: "bg-yellow-100" },
      Approved: { text: "Approved", color: "text-green-700", bgColor: "bg-green-100" },
      Rejected: { text: "Rejected", color: "text-red-700", bgColor: "bg-red-100" },
      Processing: { text: "Processing", color: "text-blue-700", bgColor: "bg-blue-100" },
      Paid: { text: "Paid", color: "text-purple-700", bgColor: "bg-purple-100" },
      RequiresMoreInfo: { text: "Requires More Info", color: "text-orange-700", bgColor: "bg-orange-100" },
    };
    
    return statusMap[status] || { text: status, color: "text-gray-700", bgColor: "bg-gray-100" };
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Error Loading Claim</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <ButtonG onClick={() => id && dispatch(fetchEmergencyClaimDetail({ id }))}>
            Retry
          </ButtonG>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <div className="text-gray-400 text-xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2">No Claim Found</h2>
          <p className="text-gray-600">The requested claim could not be found.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(claim.status);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8 space-y-8">
        {/* Success Message */}
        {successMessage && isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Emergency Claim ID: {claim.id.substring(0, 8)}...</h1>
            <p className="text-sm text-gray-500">Provider: {claim.providerId.substring(0, 8)}...</p>
          </div>
          <span className={`text-xs ${statusInfo.bgColor} ${statusInfo.color} px-3 py-1 rounded-full`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Claim Details */}
        <section>
          <FormHeader className="py-4">Claim Details</FormHeader>
          <hr className="py-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Description" value={claim.description} />
            <Info label="Claim Type" value={formatClaimType(claim.claimType)} />
            <Info label="Claim Date" value={formatDate(claim.date)} />
            <Info label="Created Date" value={formatDate(claim.createdDate)} />
            <Info label="Submitted Amount" value={formatCurrency(claim.submittedAmount)} />
            <Info label="Vetted Amount" value={formatCurrency(claim.vettedAmount)} />
            <Info label="Vetted Date" value={claim.vettedDate ? formatDate(claim.vettedDate) : "Not vetted"} />
            <Info label="Status" value={claim.status} />
          </div>
        </section>

        {/* Provider & SSHIA Information */}
        <section>
          <FormHeader className="py-4">Provider & SSHIA Information</FormHeader>
          <hr className="py-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info 
              label="Provider ID" 
              value={
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {claim.providerId}
                </span>
              } 
            />
            <Info 
              label="SSHIA ID" 
              value={
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {claim.sshiaId}
                </span>
              } 
            />
            <Info label="Is Active" value={claim.isActive ? "Yes" : "No"} />
          </div>
        </section>

        {/* Emergency Bills */}
        <section>
          <FormHeader className="py-4">Emergency Bills ({claim.emergencyBillIds.length})</FormHeader>
          <hr className="py-4" />
          {claim.emergencyBillIds.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {claim.emergencyBillIds.map((billId, index) => (
                <div key={billId} className="border rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Bill #{index + 1}</p>
                  <p className="font-mono text-xs break-all">{billId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No emergency bills attached to this claim.</p>
          )}
        </section>

        {/* Financial Summary */}
        <section>
          <FormHeader className="py-4">Financial Summary</FormHeader>
          <hr className="py-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-500 text-xs">Submitted Amount</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(claim.submittedAmount)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-500 text-xs">Vetted Amount</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(claim.vettedAmount)}
              </p>
            </div>
            {claim.vettedAmount > 0 && claim.submittedAmount > 0 && (
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs">Difference</p>
                <p className={`text-lg font-bold ${
                  claim.vettedAmount < claim.submittedAmount ? 'text-red-700' : 'text-green-700'
                }`}>
                  {formatCurrency(claim.vettedAmount - claim.submittedAmount)}
                  {claim.vettedAmount < claim.submittedAmount ? ' (Reduction)' : ' (Increase)'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <FormHeader className="py-4">Claim Timeline</FormHeader>
          <hr className="py-4" />
          <div className="space-y-3 text-sm">
            <TimelineItem 
              date={claim.createdDate} 
              title="Claim Created" 
              description="Emergency claim was submitted" 
            />
            {claim.vettedDate && (
              <TimelineItem 
                date={claim.vettedDate} 
                title="Claim Vetted" 
                description={`Amount vetted to ${formatCurrency(claim.vettedAmount)}`} 
              />
            )}
            <TimelineItem 
              date={new Date().toISOString()} 
              title="Current Status" 
              description={statusInfo.text} 
              isCurrent
            />
          </div>
        </section>

        {/* Actions */}
        <section>
          <FormHeader className="py-4">Actions</FormHeader>
          <hr className="py-4" />
          <p className="text-sm mb-4 text-gray-600">
            Review the claim details above and take appropriate action.
          </p>

          <div className="flex gap-4">
            <ButtonG>Approve Claim</ButtonG>
            <ButtonT>Request More Information</ButtonT>
            {/* <ButtonT variant="danger">Reject Claim</ButtonT> */}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TimelineItem({ 
  date, 
  title, 
  description, 
  isCurrent = false 
}: { 
  date: string; 
  title: string; 
  description: string; 
  isCurrent?: boolean;
}) {
  return (
    <div className="flex items-start">
      <div className={`w-3 h-3 rounded-full mt-1 ${isCurrent ? 'bg-blue-500' : 'bg-gray-300'}`} />
      <div className="ml-4">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          <span className="text-xs text-gray-500">{formatDate(date)}</span>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}