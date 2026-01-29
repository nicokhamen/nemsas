import React from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface BillSuccessModalProps {
  isOpen: boolean;
  onCreateAnother: () => void;
  onGoToBills: () => void;
  billDetails?: {
    billId: string;
    patientName: string;
    patientNumber: string;
    totalAmount: number;
    servicesCount: number;
    diagnosisCount: number;
    encounterId?: string;
  };
}

const BillSuccessModal: React.FC<BillSuccessModalProps> = ({
  isOpen,
  onCreateAnother,
  onGoToBills,
  billDetails,
}) => {
  if (!isOpen || !billDetails) return null;

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
      
      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            {/* Success Icon Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Emergency Bill Created Successfully!
              </h2>
              <p className="text-gray-600">
                The emergency bill has been captured and saved to the system
              </p>
            </div>

            {/* Bill Details */}
            <div className="bg-white px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Bill Details</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {/* Patient Information */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Patient Name</p>
                    <p className="font-semibold text-gray-900">{billDetails.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Patient Number</p>
                    <p className="font-semibold text-gray-900">{billDetails.patientNumber}</p>
                  </div>
                </div>

                {/* Bill Information */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  {billDetails.billId && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bill ID</p>
                      <p className="font-semibold text-gray-900">{billDetails.billId}</p>
                    </div>
                  )}
                  {billDetails.encounterId && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Encounter ID</p>
                      <p className="font-semibold text-gray-900">{billDetails.encounterId}</p>
                    </div>
                  )}
                </div>

                {/* Services & Diagnosis Count */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Services Added</p>
                    <p className="font-semibold text-gray-900">{billDetails.servicesCount} service(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Diagnosis Added</p>
                    <p className="font-semibold text-gray-900">{billDetails.diagnosisCount} diagnosis</p>
                  </div>
                </div>

                {/* Total Amount - Highlighted */}
                <div className="bg-white rounded-md p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(billDetails.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onGoToBills}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Go to Emergency Bills
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onCreateAnother}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Create Another Bill
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default BillSuccessModal;
