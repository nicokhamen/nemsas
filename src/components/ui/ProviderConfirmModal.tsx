// components/ProviderConfirmModal.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

interface ProviderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  providerData?: {
    hospitalName?: string;
    email?: string;
    providerType?: string;
    phoneNumber?: string;
  };
  isLoading?: boolean;
}

const ProviderConfirmModal: React.FC<ProviderConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  providerData,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
          Confirm Provider Registration
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-4">
          Please confirm that the following information is correct before
          submitting:
        </p>

        {/* Provider Info Summary */}
        {providerData && (
          <div className="bg-gray-50 rounded-md p-4 mb-6 space-y-2">
            {providerData.hospitalName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Hospital Name:
                </span>
                <span className="text-gray-800">
                  {providerData.hospitalName}
                </span>
              </div>
            )}
            {providerData.email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-800">{providerData.email}</span>
              </div>
            )}
            {providerData.providerType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Provider Type:
                </span>
                <span className="text-gray-800">
                  {providerData.providerType}
                </span>
              </div>
            )}
            {providerData.phoneNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Phone Number:</span>
                <span className="text-gray-800">
                  {providerData.phoneNumber}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mb-6">
          Once confirmed, this provider will be registered in the system.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Confirming..." : "Confirm & Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderConfirmModal;
