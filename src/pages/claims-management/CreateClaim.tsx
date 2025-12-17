import { useState } from "react";
import DatePicker from "../../components/form/DatePicker";
import FormHeader from "../../components/form/FormHeader";
import FormSelect from "../../components/form/FormSelect";
import Input from "../../components/form/Input";
import { claimTypeOptions } from "../../utils/claimTypeUtils";
import { mockEmergencyBills } from "../../utils/mockEmergencyBills";
import EmergencyBillsTable from "../../components/ui/EmergencyBillstable";

const CreateClaim = () => {
  const [submittedAmount, setSubmittedAmount] = useState<number>(0);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  const calculateSelectedTotal = () => {
    return selectedBillIds.reduce((total, billId) => {
      const bill = mockEmergencyBills.find((b) => b.id === billId);
      return (
        total +
        (bill
          ? bill.productServices.reduce(
              (sum, service) => sum + service.netAmount,
              0
            )
          : 0)
      );
    }, 0);
  };

  const handleBillSelectionChange = (selectedIds: string[]) => {
    setSelectedBillIds(selectedIds);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 flex justify-center">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow p-6 md:p-8 space-y-8">
          <FormHeader>Create a New Claim</FormHeader>
<form className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {/* Description */}
            <div className="...">
              {" "}
              <Input label="Description" required />
            </div>
            {/* Claim Type */}
            <div className="...">
              <FormSelect label="Claim Type" required>
                <option value="">Select Claim Type</option>
                {claimTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>
            </div>
            {/* Date */}
            <div className="...">
              <DatePicker label="Claim Date" required />
            </div>
            {/* Submitted Amount */}
            <div className="col-span-1 ...">
              <Input
                label="Submitted Amount"
                type="number"
                placeholder="0.00"
                value={submittedAmount}
                onChange={(e) =>
                  setSubmittedAmount(Number(e.target.value) || 0)
                }
                min="0"
                step="0.01"
              />
            </div>
            <div className="...">
              <div className="text-lg font-semibold text-blue-600 p-2 bg-blue-50 rounded-lg">
                N {calculateSelectedTotal().toLocaleString()}
              </div>
            </div>
          </div>

          
            {/* Form Fields Section */}

            {/* Emergency Bills Table Section */}
            <EmergencyBillsTable
              bills={mockEmergencyBills}
              selectedBillIds={selectedBillIds}
              onSelectionChange={handleBillSelectionChange}
              title="Select Emergency Bills"
              description="Choose the emergency bills to include in this claim submission"
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedBillIds.length === 0}
              >
                Create Claim ({selectedBillIds.length}{" "}
                {selectedBillIds.length === 1 ? "bill" : "bills"})
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateClaim;
