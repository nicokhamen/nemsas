import React from "react";
import { X } from "lucide-react";

export type ClaimStatus = "New" | "Pending" | "Approved" | "Rejected";
export type ClaimType = "ETC" | "MEDICAL" | "DENTAL" | "OTHER";

export interface Claim {
  description: string;
  claimType: ClaimType;
  date: string;
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  vettedAmount: number;
  submittedAmount: number;
  submittedDate: string;
  vettedDate: string;
  createdDate: string;
  isActive: boolean;
  providerId: string;
  sshiaId: string;
}

interface ClaimDetailsModalProps {
  claim: Claim;
  onClose: () => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  onClose,
}) => {
  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleString() : "N/A";

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);

  const statusColor =
    claim.status === "Approved"
      ? "bg-green-100 text-green-700"
      : claim.status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : claim.status === "Rejected"
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[750px] rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-700">Claim Details</h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Claim Title Section */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-800">
                {claim.claimNumber}
              </h3>

              <span className={`text-xs px-3 py-1 rounded-full ${statusColor}`}>
                {claim.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">{claim.claimType}</p>
          </div>
        </div>

        {/* Claim Information */}
        <div className="px-6 py-4">
          <h4 className="text-red-500 font-semibold mb-4">Claim Information</h4>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-400">Description</p>
              <p className="font-medium text-gray-700">{claim.description}</p>
            </div>

            <div>
              <p className="text-gray-400">Status</p>
              <p className="font-medium text-gray-700">{claim.status}</p>
            </div>

            <div>
              <p className="text-gray-400">Claim Type</p>
              <p className="font-medium text-gray-700">{claim.claimType}</p>
            </div>

            <div>
              <p className="text-gray-400">Claim Date</p>
              <p className="font-medium text-gray-700">
                {formatDate(claim.date)}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Submitted Amount</p>
              <p className="font-medium text-gray-700">
                {formatCurrency(claim.submittedAmount)}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Vetted Amount</p>
              <p className="font-medium text-gray-700">
                {formatCurrency(claim.vettedAmount)}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Submitted Date</p>
              <p className="font-medium text-gray-700">
                {formatDate(claim.submittedDate)}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Vetted Date</p>
              <p className="font-medium text-gray-700">
                {formatDate(claim.vettedDate)}
              </p>
            </div>

            {/* <div>
              <p className="text-gray-400">Provider ID</p>
              <p className="font-medium text-gray-700">
                {claim.providerId}
              </p>
            </div>

            <div>
              <p className="text-gray-400">SSHIA ID</p>
              <p className="font-medium text-gray-700">
                {claim.sshiaId}
              </p>
            </div> */}

            <div>
              <p className="text-gray-400">Created Date</p>
              <p className="font-medium text-gray-700">
                {formatDate(claim.createdDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
