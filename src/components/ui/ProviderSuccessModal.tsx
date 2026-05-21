// src/components/ui/ProviderSuccessModal.tsx
import React from "react";
import { CheckCircle, X } from "lucide-react";

interface ProviderSuccessModalProps {
  isOpen: boolean;
  onCreateAnother: () => void;
  onGoToProviders: () => void;
  providerDetails?: {
    providerName: string;
    providerCode: string;
    email: string;
    phoneNumber: string;
  };
}

const ProviderSuccessModal: React.FC<ProviderSuccessModalProps> = ({
  isOpen,
  onCreateAnother,
  onGoToProviders,
  providerDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        <button
          onClick={onGoToProviders}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center p-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Provider Registered Successfully!
          </h2>

          <p className="text-gray-600 mb-6">
            The provider has been successfully registered in the system.
          </p>

          {providerDetails && (
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-500">Provider Details:</p>
              <p className="font-medium text-gray-900">
                {providerDetails.providerName}
              </p>
              <p className="text-sm text-gray-600">
                Code: {providerDetails.providerCode}
              </p>
              <p className="text-sm text-gray-600">
                Email: {providerDetails.email}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {providerDetails.phoneNumber}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onCreateAnother}
              className="flex-1 px-4 py-2 border border-[#DC2626] text-[#DC2626] rounded-md hover:bg-red-50 transition-colors font-medium"
            >
              Register Another
            </button>
            <button
              onClick={onGoToProviders}
              className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              View All Providers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSuccessModal;