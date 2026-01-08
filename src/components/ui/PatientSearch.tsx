import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useProviderContext } from '../../context/useProviderContext';

interface PatientSearchProps {
  onPatientSelect: (patientId: string, patientData?: any) => void;
  onNewPatient: () => void;
  placeholder?: string;
  availablePatients?: any[];
}

export default function PatientSearch({
  onPatientSelect,
  onNewPatient,
  placeholder = "Search by patient number, name, or phone...",
  availablePatients = []
}: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { selectedProviderId } = useProviderContext();

  // Simple local search function
  const performLocalSearch = useCallback((term: string, patients: any[]) => {
    if (term.trim().length < 2) {
      return [];
    }

    const termLower = term.toLowerCase().trim();
    
    return patients.filter((patient) => {
      if (!patient) return false;
      
      return (
        (patient.hospitalNumber?.toLowerCase() || '').includes(termLower) ||
        (patient.firstName?.toLowerCase() || '').includes(termLower) ||
        (patient.lastName?.toLowerCase() || '').includes(termLower) ||
        (patient.phoneNumber || '').includes(term)
      );
    });
  }, []);

  // Debounced search - only searches locally
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = performLocalSearch(searchTerm, availablePatients);
      setSearchResults(results);
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, availablePatients, performLocalSearch]);

  const handleSelectPatient = (patient: any) => {
    if (patient && patient.id) {
      onPatientSelect(patient.id, patient);
      setSearchTerm(`${patient.firstName} ${patient.lastName}`);
      setShowResults(false);
    }
  };

  const handleNewPatient = () => {
    onNewPatient();
    setSearchTerm('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
    
    if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      handleSelectPatient(searchResults[0]);
    }
  };

  return (
    <div className="relative">
      {!selectedProviderId && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          Please select a provider first to search for patients
        </div>
      )}
      
      {/* Show info about available patients */}
      {selectedProviderId && availablePatients.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
          Searching through {availablePatients.length} existing patient{availablePatients.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {selectedProviderId && availablePatients.length === 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
          No existing patients found. You can register a new patient.
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowResults(false), 20000)}
            placeholder={selectedProviderId ? placeholder : "Select a provider first"}
            disabled={!selectedProviderId}
            className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              !selectedProviderId ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
            }`}
          />
          
          {/* Loading spinner */}
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
          
          {/* Clear search button */}
          {searchTerm && !isSearching && selectedProviderId && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
            >
              <span className="text-gray-400 hover:text-gray-600 text-xl">×</span>
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-2 border border-gray-200 max-h-96 overflow-y-auto">
              <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                Found {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''}
              </div>
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="cursor-pointer px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Existing Patient
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Patient #: </span>
                          {patient.hospitalNumber || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Phone: </span>
                          {patient.phoneNumber || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Insurance: </span>
                          {patient.insuranceStatus || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Gender: </span>
                          {patient.gender || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium ml-2 whitespace-nowrap">
                      Select →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showResults && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-6 px-4 text-center border border-gray-200">
              <div className="text-gray-500 mb-3">No matching patients found</div>
              <button
                onClick={handleNewPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                Register New Patient
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleNewPatient}
          disabled={!selectedProviderId}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap ${
            !selectedProviderId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          New Patient
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {selectedProviderId 
          ? `Search existing patients by patient number, name, or phone number`
          : "Select a provider to enable patient search"}
      </div>
    </div>
  );
}