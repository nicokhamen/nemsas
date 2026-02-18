import { ICDSearch } from "../../../../../components/ui/ICDSearch";
import type { ICDItem } from "../../../../../types/emergency-bill";

interface Diagnosis {
  id: string;
  type: string;
  code: string;
  name: string;
  note: string;
}

interface DiagnosisSectionProps {
  diagnoses: Diagnosis[];
  selectedDiagnoses: string[];
  editingNoteId: string | null;
  noteInput: string;
  onSelectDiagnosis: (selectedItem: ICDItem & { type: string }) => void;
  onRemoveDiagnosis: (id: string, e: React.MouseEvent) => void;
  onEditNote: (id: string) => void;
  onSaveNote: (id: string) => void;
  onCancelNote: () => void;
  onDiagnosisSelection: (id: string) => void;
  setNoteInput: (value: string) => void;
}

export default function DiagnosisSection({
  diagnoses,
  selectedDiagnoses,
  editingNoteId,
  noteInput,
  onSelectDiagnosis,
  onRemoveDiagnosis,
  onEditNote,
  onSaveNote,
  onCancelNote,
  onDiagnosisSelection,
  setNoteInput,
}: DiagnosisSectionProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Diagnosis Search & Selection
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Select ICD version and type at least 3 characters to search
          for diagnoses. Select a diagnosis to add it to the table
          below.
        </p>
        <ICDSearch onSelect={onSelectDiagnosis} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-40">
                Type
              </th>
              <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-32">
                Code
              </th>
              <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                Diagnosis
              </th>
              <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                Note
              </th>
              <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700 w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 ${
                  selectedDiagnoses.includes(item.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="border border-gray-300 p-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDiagnoses.includes(item.id)}
                      onChange={() => onDiagnosisSelection(item.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 font-medium text-gray-800">
                      {item.type}
                    </span>
                  </label>
                </td>

                <td className="border border-gray-300 p-3">
                  <code className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                    {item.code}
                  </code>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-gray-800">{item.name}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  {editingNoteId === item.id ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter note..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => onSaveNote(item.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={onCancelNote}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : item.note ? (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        {item.note}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditNote(item.id)}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onEditNote(item.id)}
                      className="text-gray-400 hover:text-gray-600 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add note
                    </button>
                  )}
                </td>

                <td className="border border-gray-300 p-3">
                  <button
                    type="button"
                    onClick={(e) => onRemoveDiagnosis(item.id, e)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 hover:border-red-300 text-sm transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {diagnoses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No diagnoses added yet. Use the search above to add
          diagnoses.
        </div>
      )}
    </div>
  );
}