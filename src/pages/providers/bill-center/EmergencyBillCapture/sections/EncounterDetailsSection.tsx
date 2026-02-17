import FormSelect from "../../../../components/form/FormSelect";
import { serviceTypeOptions, dischargeTypeOptions } from "../../../../utils/emergencyBillUtils";

interface EncounterDetailsSectionProps {
  departments: Array<{ id: string; name: string }>;
  departmentsLoading: boolean;
  departmentsError: string | null;
  selectedDepartment: string;
  selectedServiceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string;
  onDepartmentChange: (value: string) => void;
  onServiceTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onDischargeStatusChange: (value: string) => void;
  onDischargeDateChange: (value: string) => void;
}

export default function EncounterDetailsSection({
  departments,
  departmentsLoading,
  departmentsError,
  selectedDepartment,
  selectedServiceType,
  encounterStartDateTime,
  dischargeStatus,
  dischargeDate,
  onDepartmentChange,
  onServiceTypeChange,
  onStartDateChange,
  onDischargeStatusChange,
  onDischargeDateChange,
}: EncounterDetailsSectionProps) {
  return (
    <>
      <div className="col-span-2">
        <FormSelect
          label="Enter name"
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          required
          isLoading={departmentsLoading}
          error={departmentsError}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <FormSelect
          label="Service Type"
          value={selectedServiceType}
          onChange={(e) => onServiceTypeChange(e.target.value)}
          required
        >
          <option value="">Select Service Type</option>
          {serviceTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={encounterStartDateTime}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full border rounded-xl p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discharge status
        </label>
        <FormSelect
          label="Discharge Status"
          value={dischargeStatus}
          onChange={(e) => onDischargeStatusChange(e.target.value)}
        >
          <option value="">Select Discharge Status</option>
          {dischargeTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discharge Date
        </label>
        <input
          type="date"
          value={dischargeDate}
          onChange={(e) => onDischargeDateChange(e.target.value)}
          className="w-full border rounded-xl p-2"
        />
      </div>
    </>
  );
}