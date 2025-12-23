// components/ui/DiagnosisSearchTable.tsx
import React, { useState } from 'react';
import { ICDSearch } from './ICDSearch';
import type { ICDItem } from '../../types/emergency-bill';

// Define Diagnosis type
export interface Diagnosis {
  id: string;
  type: string;
  code: string;
  name: string;
  note: string;
}

interface DiagnosisSearchTableProps {
  diagnoses: Diagnosis[];
  selectedDiagnoses: string[];
  onDiagnosesChange: (diagnoses: Diagnosis[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onNoteChange?: (id: string, note: string) => void;
  maxHeight?: string;
  showEmptyState?: boolean;
  className?: string;
}

export const DiagnosisSearchTable: React.FC<DiagnosisSearchTableProps> = ({
  diagnoses,
  selectedDiagnoses,
  onDiagnosesChange,
  onSelectionChange,
  onNoteChange,
  maxHeight = '400px',
  showEmptyState = true,
  className = '',
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Handle ICD search selection
  const handleSelect = (selectedItem: ICDItem & { type: string }) => {
    const newId = Date.now().toString();
    const newDiagnosis: Diagnosis = {
      id: newId,
      type: selectedItem.type,
      code: selectedItem.code,
      name: selectedItem.name,
      note: `Selected from search: ${selectedItem.name}`,
    };

    const updatedDiagnoses = [...diagnoses, newDiagnosis];
    onDiagnosesChange(updatedDiagnoses);
    
    // Auto-select the newly added diagnosis
    const updatedSelection = [...selectedDiagnoses, newId];
    onSelectionChange(updatedSelection);
  };

  // Handle checkbox change for diagnosis selection
  const handleDiagnosisChange = (id: string) => {
    const updatedSelection = selectedDiagnoses.includes(id)
      ? selectedDiagnoses.filter((v) => v !== id)
      : [...selectedDiagnoses, id];
    
    onSelectionChange(updatedSelection);
  };

  // Handle remove diagnosis
  const handleRemoveDiagnosis = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedDiagnoses = diagnoses.filter((item) => item.id !== id);
    onDiagnosesChange(updatedDiagnoses);
    
    const updatedSelection = selectedDiagnoses.filter((itemId) => itemId !== id);
    onSelectionChange(updatedSelection);

    // Clear editing state if removing the item being edited
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setNoteInput('');
    }
  };

  // Handle note editing
  const handleEditNote = (id: string) => {
    const item = diagnoses.find((d) => d.id === id);
    setEditingNoteId(id);
    setNoteInput(item?.note || '');
  };

  const handleSaveNote = (id: string) => {
    const updatedDiagnoses = diagnoses.map((item) =>
      item.id === id ? { ...item, note: noteInput } : item
    );
    
    onDiagnosesChange(updatedDiagnoses);
    
    // If parent wants to handle note changes separately
    if (onNoteChange) {
      onNoteChange(id, noteInput);
    }
    
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteInput('');
  };

  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Diagnosis Search & Selection
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Select ICD version and type at least 3 characters to search
          for diagnoses. Select a diagnosis to add it to the table
          below.
        </p>
        <ICDSearch onSelect={handleSelect} />
      </div>

      {/* Diagnosis table */}
      <div 
        className="overflow-x-auto" 
        style={{ maxHeight: maxHeight, overflowY: 'auto' }}
      >
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
                  selectedDiagnoses.includes(item.id)
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                {/* Type column with checkbox for selection */}
                <td className="border border-gray-300 p-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDiagnoses.includes(item.id)}
                      onChange={() => handleDiagnosisChange(item.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 font-medium text-gray-800">
                      {item.type}
                    </span>
                  </label>
                </td>

                {/* Diagnosis code display */}
                <td className="border border-gray-300 p-3">
                  <code className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                    {item.code}
                  </code>
                </td>

                {/* Diagnosis name */}
                <td className="border border-gray-300 p-3">
                  <span className="text-gray-800">{item.name}</span>
                </td>

                {/* Note column with edit/save functionality */}
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
                        onClick={() => handleSaveNote(item.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNote}
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
                        onClick={() => handleEditNote(item.id)}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditNote(item.id)}
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

                {/* Remove button for diagnosis */}
                <td className="border border-gray-300 p-3">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDiagnosis(item.id, e)}
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

      {/* Empty state for diagnosis table */}
      {showEmptyState && diagnoses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No diagnoses added yet. Use the search above to add diagnoses.
        </div>
      )}
    </div>
  );
};