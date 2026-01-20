import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { useProviderContext } from "../../context/useProviderContext";
import { fetchEmergencyBillDetails } from "../../services/thunks/emergencyBillsThunk";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ArrowLeft, Pencil } from "lucide-react";
import { clearCurrentBill, clearError } from "../../services/slices/emergencyBillSlice";

const EmergencyBillDetails = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProviderId } = useProviderContext();

  // Get emergency bill details from Redux state
  const { currentBill, loading, error } = useAppSelector(
    (state) => state.emergencyBills
  );

  // Fetch emergency bill details when component mounts
  useEffect(() => {
    if (billId && selectedProviderId) {
      dispatch(fetchEmergencyBillDetails({ 
        emergencyBillId: billId, 
        providerId: selectedProviderId 
      }));
    }
  }, [billId, selectedProviderId, dispatch]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentBill());
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Helper functions
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "0.00";
    return `₦${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // Calculate total amount from productServices
  const calculateTotal = () => {
    if (!currentBill?.productServices) return 0;
    return currentBill.productServices.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!currentBill) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">No Bill Data Found</h2>
          <p className="text-gray-700 mb-4">
            Could not find emergency bill details for the provided ID.
          </p>
          <button
            onClick={handleBack}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const patient = currentBill.patient || {};
  const totalAmount = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Bill Details</h2>
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100" title="Back"
        >
          {/* <X className="w-5 h-5 text-gray-500" /> */}
          <ArrowLeft className="w-5 h-5 text-gray-500"  />
        </button>
      </div>

      {/* Claim Meta */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-red-500 font-medium">Bill Status</span>
          <span className="text-gray-500">•</span>
          {/* <span className="font-medium">{currentBill.id}</span> */}
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              currentBill.status === "Rejected"
                ? "bg-red-100 text-red-600"
                : currentBill.status === "Approved"
                ? "bg-green-100 text-green-600"
                : currentBill.status === "Pending"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            
            {/* No Status */}
            {currentBill.status || "Unknown"}
          </span>
        </div>
        <button 
      onClick={() => navigate(`/emergency-bills/${billId}/edit`)}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg">
          <Pencil className="w-4 h-4" />
          Edit & Resubmit
        </button>
      </div>

      {/* Patient Header */}
      <div className="px-6 py-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden" />
        <div>
          <p className="font-semibold">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-sm text-gray-500">
            {patient.hospitalNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Patient Details */}
      <Section title="Patient Details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Item label="Patient Number" value={patient.hospitalNumber || "N/A"} />
          <Item label="Gender" value={patient.gender || "N/A"} />
          <Item label="Phone number" value={patient.phoneNumber || "N/A"} />
          <Item label="Insurance" value={patient.insuranceStatus || "N/A"} />
          <Item label="Department Name" value={currentBill.department || "N/A"} />
          <Item label="Email" value={patient.email || "N/A"} />
          <Item label="Age" value={patient.age?.toString() || "N/A"} />
          <Item label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
        </div>
      </Section>

      {/* Encounter Details */}
      <Section title="Encounter Details & Diagnosis">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Item label="Encounter ID" value={currentBill.encounterId || "N/A"} />
          <Item label="Service Type" value={currentBill.serviceType || "N/A"} />
          <Item
            label="Encounter Date"
            value={formatDate(currentBill.encounterStartDateTime)}
          />
          <Item
            label="Discharge Date"
            value={formatDate(currentBill.dischargeDate)}
          />
          <Item
            label="Attending Physician"
            value={currentBill.attendingPhysician || "N/A"}
          />
          <Item
            label="Total Amount" className="text-green-600"
            value={formatCurrency(totalAmount)}
          />
        </div>
      </Section>

      {/* Diagnoses */}
      {currentBill.diagnoses && currentBill.diagnoses.length > 0 && (
        <Section title="Diagnoses">
          <div className="space-y-3">
            {currentBill.diagnoses.map((diagnosis, index) => (
              <div
                key={diagnosis.id || index}
                className="p-3 border rounded-lg bg-gray-50"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Item label="Type" value={diagnosis.type || "N/A"} />
                  <Item label="Code" value={diagnosis.code || "N/A"} />
                  <Item
                    label="Diagnosis"
                    value={diagnosis.diagnosis || "N/A"}
                    className="col-span-2"
                  />
                  <Item
                    label="Note"
                    value={diagnosis.note || "No comment..."}
                    className="col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Services Billed */}
   {currentBill.productServices && currentBill.productServices.length > 0 && (
  <Section title="Services Billed">
    <div className="overflow-hidden rounded-lg border">
      {/* Table Header */}
      <div className="grid grid-cols-7 bg-green-50 text-xs font-medium text-gray-600 px-4 py-3">
        <div className="col-span-1">Name</div>
        <div className="col-span-1">Description</div>
        <div className="col-span-1">NHIS Price</div>
        <div className="col-span-1">NHIS Percentage</div>
        <div className="col-span-1 text-right">Qty</div>
        <div className="col-span-1 text-right">Unit Price</div>
        <div className="col-span-1 text-right">Total Amount</div>
      </div>

      {/* Table Body */}
      {currentBill.productServices.map((service, index) => {
        const itemTotal = (service.price || 0) * (service.quantity || 1);
        return (
          <div
            key={service.id || index}
            className="grid grid-cols-7 px-4 py-3 border-t text-sm hover:bg-gray-50"
          >
            <div className="col-span-1 font-medium">{service.name || "N/A"}</div>
            <div className="col-span-1 text-gray-600">{service.description || "—"}</div>
            <div className="col-span-1 text-gray-500">{service.nhisPrice || "—"}</div>
            <div className="col-span-1 text-gray-500">{service.nhisPercentage || "—"}</div>
            <div className="col-span-1 text-right">{service.quantity || 0}</div>
            <div className="col-span-1 text-right">{formatCurrency(service.price)}</div>
            <div className="col-span-1 text-right font-medium text-green-600">
              {formatCurrency(itemTotal)}
            </div>
          </div>
        );
      })}

      {/* Total Row */}
      <div className="grid grid-cols-7 px-4 py-3 border-t bg-gray-50 font-medium text-sm">
        <div className="col-span-5"></div>
        <div className="col-span-1 text-right">Total:</div>
        <div className="col-span-1 text-right text-green-600">
          {formatCurrency(totalAmount)}
        </div>
      </div>
    </div>
  </Section>
)}

      {/* Supporting Documents */}
      {currentBill.supportingDocuments &&
        currentBill.supportingDocuments.length > 0 && (
          <Section title="Supporting Documents">
            <div className="flex flex-wrap gap-2">
              {currentBill.supportingDocuments.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-blue-600"
                >
                  Document {index + 1}
                </a>
              ))}
            </div>
          </Section>
        )}
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="px-6 py-4 border-t">
    <h3 className="text-sm font-semibold text-red-500 mb-4">{title}</h3>
    {children}
  </div>
);

const Item = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`flex justify-between ${className}`}>
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

export default EmergencyBillDetails;