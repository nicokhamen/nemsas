import React from 'react';
import ReactDOM from 'react-dom';

interface PatientConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientData: {
    hospitalNumber: string;
    firstName: string;
    lastName: string;
    insuranceStatus: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    email?: string;
    phoneNumber: string;
  };
  isLoading?: boolean;
}

const PatientConfirmModal: React.FC<PatientConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientData,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatInsuranceStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            {/* Header - Using warning icon instead of info icon */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>

                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Confirm Patient Registration
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Please review the patient information below. This action cannot be undone once confirmed.
                  </p>

                  {/* Patient Information Summary */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Hospital Number */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Patient Number</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.hospitalNumber}</p>
                      </div>

                      {/* Full Name */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {patientData.firstName} {patientData.lastName}
                        </p>
                      </div>

                      {/* Date of Birth & Age */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(patientData.dateOfBirth)}
                        </p>
                      </div>

                      {/* Gender */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900">
                          {patientData.gender}
                        </p>
                      </div>

                      {/* Insurance Status */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Insurance Status</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatInsuranceStatus(patientData.insuranceStatus)}
                        </p>
                      </div>

                      {/* Phone Number */}
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {patientData.phoneNumber}
                        </p>
                      </div>

                      {/* Email (if provided) */}
                      {patientData.email && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">
                            {patientData.email}
                          </p>
                        </div>
                      )}

                      {/* Address */}
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {patientData.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Message */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <p className="text-sm text-yellow-700">
                        <span className="font-semibold">Warning:</span> This action cannot be undone. 
                        Please verify all information is correct before confirming.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Matching VettingModal style */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              {/* Confirm Button */}
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:w-auto disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Confirm Registration'
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PatientConfirmModal;