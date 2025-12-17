
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, User, Calendar, Pill, Stethoscope, Building, BadgeDollarSign } from 'lucide-react';

export interface EmergencyBill {
  id: string;
  encounterId: string;
  department: string;
  serviceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string | null;
  attendingPhysician: string;
  patient: {
    hospitalNumber: string;
    firstName: string;
    lastName: string;
    insuranceStatus: string;
  };
  productServices: Array<{
    name: string;
    price: number;
    nhisPrice: number;
    quantity: number;
    netAmount: number;
  }>;
}

interface EmergencyBillsTableProps {
  bills: EmergencyBill[];
  selectedBillIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  title?: string;
  description?: string;
}

const EmergencyBillsTable: React.FC<EmergencyBillsTableProps> = ({
  bills,
  selectedBillIds,
  onSelectionChange,
  title = "Emergency Bills",
  description = "Select bills to include in this claim"
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleBillSelection = (billId: string) => {
    const newSelected = selectedBillIds.includes(billId)
      ? selectedBillIds.filter(id => id !== billId)
      : [...selectedBillIds, billId];
    onSelectionChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBillIds.length === bills.length && bills.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bills.map(bill => bill.id));
    }
  };

  const toggleRowExpand = (billId: string) => {
    setExpandedRow(prev => prev === billId ? null : billId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalAmount = (bill: EmergencyBill) => {
    return bill.productServices.reduce((sum, service) => sum + service.netAmount, 0);
  };

  const calculateNHISTotal = (bill: EmergencyBill) => {
    return bill.productServices.reduce((sum, service) => sum + service.nhisPrice, 0);
  };

  const calculateSelectedTotal = () => {
    return selectedBillIds.reduce((total, billId) => {
      const bill = bills.find(b => b.id === billId);
      return total + (bill ? calculateTotalAmount(bill) : 0);
    }, 0);
  };

  const calculateSelectedNHISTotal = () => {
    return selectedBillIds.reduce((total, billId) => {
      const bill = bills.find(b => b.id === billId);
      return total + (bill ? calculateNHISTotal(bill) : 0);
    }, 0);
  };

  if (bills.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emergency Bills Found</h3>
        <p className="text-gray-500">There are no emergency bills available to display.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {selectedBillIds.length} of {bills.length} selected
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBillIds.length === bills.length && bills.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Patient
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    Department
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    Service Type
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Encounter Date
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <BadgeDollarSign className="h-4 w-4" />
                    Total Amount
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Pill className="h-4 w-4" />
                    Status
                  </div>
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <React.Fragment key={bill.id}>
                  <tr 
                    className={`hover:bg-gray-50 ${selectedBillIds.includes(bill.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBillIds.includes(bill.id)}
                        onChange={() => toggleBillSelection(bill.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {bill.patient.firstName} {bill.patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bill.patient.hospitalNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {bill.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(bill.encounterStartDateTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        GH₵ {calculateTotalAmount(bill).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600">
                        NHIS: GH₵ {calculateNHISTotal(bill).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bill.dischargeStatus === 'Discharged' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.dischargeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRowExpand(bill.id)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={expandedRow === bill.id ? "Collapse details" : "Expand details"}
                      >
                        {expandedRow === bill.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Details */}
                  {expandedRow === bill.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Patient Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Insurance Status:</span>
                                <span className="text-gray-900">{bill.patient.insuranceStatus}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Encounter ID:</span>
                                <span className="text-gray-900">{bill.encounterId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Attending Physician:</span>
                                <span className="text-gray-900">{bill.attendingPhysician}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Discharge Date:</span>
                                <span className="text-gray-900">
                                  {bill.dischargeDate ? formatDate(bill.dischargeDate) : 'Not discharged'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Services ({bill.productServices.length})</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                              {bill.productServices.map((service, index) => (
                                <div key={index} className="flex justify-between text-sm p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-gray-900 font-medium">{service.name}</div>
                                    <div className="text-gray-500 text-xs">Qty: {service.quantity}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-gray-900 font-medium">
                                      GH₵ {service.netAmount.toLocaleString()}
                                    </div>
                                    <div className="text-green-600 text-xs">
                                      NHIS: GH₵ {service.nhisPrice.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Total selected: {selectedBillIds.length} bill{selectedBillIds.length !== 1 ? 's' : ''}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Claim Amount:</div>
              <div className="text-xl font-bold text-blue-600">
                GH₵ {calculateSelectedTotal().toLocaleString()}
              </div>
              <div className="text-sm text-green-600">
                NHIS Coverage: GH₵ {calculateSelectedNHISTotal().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBillsTable;