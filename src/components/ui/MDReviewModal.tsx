import React from "react";
import ReactDOM from "react-dom";
import type { ClaimEmergencyBill } from "../../types/ClaimEmergencyBills";
import Button from "./Button";
import { generateMdReviewPdf } from "../../utils/mdReviewPdf";

interface MDReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  bills: ClaimEmergencyBill[];
  claimId: string;
  isLoading?: boolean;
  mdName?: string;
  signatureDataUrl?: string;
}

const MDReviewModal: React.FC<MDReviewModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  bills,
  claimId,
  isLoading = false,
  mdName = "",
  signatureDataUrl = "",
}) => {
  if (!isOpen) return null;

  const allBillsApproved = bills.length > 0 && bills.every((b) => b.status === "Approved");

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const primaryBill = bills[0];
  if (!primaryBill) return null;

  const patient = primaryBill.patient;
  const diagnosis = primaryBill.diagnoses?.[0];
  const encounter = {
    id: primaryBill.encounterId || "N/A",
    date: formatDate(primaryBill.encounterStartDateTime),
    diagnosis: diagnosis?.diagnosis || "N/A",
    diagnosisType: diagnosis?.type || "N/A",
    diagnosisCode: diagnosis?.code || "N/A",
    diagnosisNote: diagnosis?.note || "No comment...",
    emergencyType: primaryBill.serviceType || "N/A",
    ward: primaryBill.department || "N/A",
  };

  const allDocuments = bills.flatMap((bill) => bill.supportingDocuments || []);

  const totalAmount = bills.reduce((sum, bill) => {
    const billTotal =
      bill.productServices?.reduce((t, service) => t + service.netAmount, 0) ||
      0;
    return sum + billTotal;
  }, 0);

  const getFileName = (path: string) => {
    return path.split("/").pop() || path;
  };

  const modalContent = (
    <div className="fixed inset-0 z-9999">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-2xl">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                MD Endorsement
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="border border-gray-400 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:border-gray-600 disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Claim Info + Actions */}
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {claimId}
                    </h3>
                    <p className="text-sm text-gray-600">{encounter.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {allBillsApproved ? (
                      <Button
                        onClick={() =>
                          generateMdReviewPdf({
                            mdName: mdName || "Medical Director",
                            signatureDataUrl,
                            claimId,
                            bills,
                          })
                        }
                        color="green"
                        size="sm"
                        className="rounded-sm"
                      >
                        Download PDF
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={onApprove}
                          disabled={isLoading}
                          color="green"
                          size="sm"
                          className="rounded-sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={onReject}
                          disabled={isLoading}
                          color="red"
                          variant="outline"
                          size="sm"
                          className="rounded-sm"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 mb-1 uppercase">
                  Patient Details
                </h4>
                <hr className="mb-3 border-gray-200" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Patient Number</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {patient?.hospitalNumber || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Gender</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {patient?.gender || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Phone number</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {patient?.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Insurance</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {patient?.insuranceStatus || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Hospital Name</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {primaryBill.hospitalName || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Email</p>
                    <p className="text-sm font-semibold text-gray-900 text-right truncate max-w-40">
                      {patient?.email || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-between gap-6">
                    <p className="text-xs text-gray-500 shrink-0">Address</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {patient?.address || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Age</p>
                    <p className="text-sm font-bold text-gray-900 text-right">
                      {patient?.age || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Encounter Details & Diagnosis */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 mb-1 uppercase">
                  Encounter Details &amp; Diagnosis
                </h4>
                <hr className="mb-3 border-gray-200" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Encounter ID</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.id}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Emergency Type</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.emergencyType}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Encounter Date</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.date}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Ward/Unit</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.ward}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Type</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.diagnosisType}
                    </p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <p className="text-xs text-gray-500 shrink-0">Code</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.diagnosisCode}
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-between gap-6">
                    <p className="text-xs text-gray-500 shrink-0">Diagnosis</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.diagnosis}
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-between gap-6">
                    <p className="text-xs text-gray-500 shrink-0">Note</p>
                    <p className="text-sm font-semibold text-gray-900 text-right">
                      {encounter.diagnosisNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {allDocuments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-1 uppercase">
                    Uploaded Documents
                  </h4>
                  <hr className="mb-3 border-gray-200" />
                  <div className="grid grid-cols-2 gap-y-3">
                    {allDocuments.map((doc, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-700 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        {getFileName(doc)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Billed */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 mb-1 uppercase">
                  Products & Services 
                </h4>
                <hr className="mb-3 border-gray-200" />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 text-gray-600 font-medium">
                          Tariff Code
                        </th>
                        <th className="text-left px-4 py-2 text-gray-600 font-medium">
                          Description
                        </th>
                        <th className="text-center px-4 py-2 text-gray-600 font-medium">
                          Qty
                        </th>
                        <th className="text-right px-4 py-2 text-gray-600 font-medium">
                          Unit Price
                        </th>
                        <th className="text-right px-4 py-2 text-gray-600 font-medium">
                          Total Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) =>
                        bill.productServices?.map((service, idx) => (
                          <tr
                            key={`${bill.id}-${idx}`}
                            className="border-b border-gray-100"
                          >
                            <td className="px-4 py-2 text-gray-700">
                              {service.code || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {service.name || "N/A"}
                            </td>
                            <td className="text-center px-4 py-2 text-gray-700">
                              {service.quantity || 1}
                            </td>
                            <td className="text-right px-4 py-2 text-gray-700">
                              {service.price?.toLocaleString("en-NG") || "0"}
                            </td>
                            <td className="text-right px-4 py-2 font-semibold text-gray-900">
                              {formatCurrency(service.netAmount || 0)}
                            </td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                  <p className="text-sm font-semibold text-gray-900">
                    Total: {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default MDReviewModal;
