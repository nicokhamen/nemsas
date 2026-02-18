import Input from "../../../../../components/form/Input";

interface PhysicianSectionProps {
  attendingPhysician: string;
  onPhysicianChange: (value: string) => void;
}

export default function PhysicianSection({
  attendingPhysician,
  onPhysicianChange,
}: PhysicianSectionProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Attending Physician
      </h2>
      <div className="max-w-md">
        <Input
          type="text"
          value={attendingPhysician}
          onChange={(e) => onPhysicianChange(e.target.value)}
          label="Enter physician name"
          required
        />
      </div>
    </div>
  );
}