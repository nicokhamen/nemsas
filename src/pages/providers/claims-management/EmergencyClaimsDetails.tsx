import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import FormHeader from "../../../components/form/FormHeader";
import { useAppDispatch } from "../../../hooks/redux";

// Table imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";
import { Pagination } from "../../../components/pagination";

// Thunk and actions
import { fetchEmergencyBillPatients } from "../../../services/thunks/emergencyBillPatientsThunk";
import { clearEmergencyBillPatients } from "../../../services/slices/emergencyBillPatientsSlice";

// Status color map for insurance status
const insuranceStatusColor: Record<string, string> = {
  NHIA: "#2196f3",
  Private: "#4caf50",
  'Self-Pay': "#9c27b0",
  Default: "#6b6f80",
};

// Gender color mapping
const genderColor: Record<string, string> = {
  Male: "#2196f3",
  Female: "#e91e63",
  Other: "#9c27b0",
  Default: "#6b6f80",
};

// Format currency
const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const EmergencyClaimsDetails = () => {
  const { id: claimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get providerId from auth context
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerId = currentUser?.providerId || "";
  
  // Get emergency bill patients data from Redux store
  const { 
    data: emergencyBillPatients,
    loading, 
    error,
  } = useSelector((state: RootState) => state.emergencyBillPatients);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Load emergency bill patients when claimId and providerId are available
  const loadEmergencyBillPatients = useCallback(() => {
    if (claimId && providerId) {
      dispatch(fetchEmergencyBillPatients({ 
        emergencyClaimId: claimId, 
        providerId 
      }));
    }
  }, [dispatch, claimId, providerId]);

  // Load data on component mount or when IDs change
  useEffect(() => {
    if (claimId && providerId) {
      loadEmergencyBillPatients();
    }
    
    // Clear data when component unmounts
    return () => {
      dispatch(clearEmergencyBillPatients());
    };
  }, [dispatch, claimId, providerId, loadEmergencyBillPatients]);

  // Map emergency bill patients to table format
  const tablePatients = useMemo(() => {
    if (!emergencyBillPatients?.data) return [];
    
    return emergencyBillPatients.data.map((patient, index) => ({
      sn: index + 1,
      hospitalNumber: patient.hospitalNumber || 'N/A',
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      fullName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'N/A',
      insuranceStatus: patient.insuranceStatus || 'N/A',
      dateOfBirth: patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A',
      gender: patient.gender || 'N/A',
      address: patient.address || 'N/A',
      email: patient.email || 'N/A',
      phoneNumber: patient.phoneNumber || 'N/A',
      id: patient.id,
      isActive: patient.isActive,
      age: patient.age || 'N/A',
      totalAmount: patient.totalAmount || 0,
      numberOfEncounters: patient.numberOfEncounters || 0,
    }));
  }, [emergencyBillPatients]);

  // Define columns for the emergency bill patients table
  const columns: ColumnDef<(typeof tablePatients)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "hospitalNumber",
      header: "Hospital No.",
      enableSorting: true,
    },
    {
      accessorKey: "fullName",
      header: "Patient Name",
      enableSorting: true,
    },
    {
      accessorKey: "insuranceStatus",
      header: "Insurance Status",
      cell: ({ row }) => {
        const status = row.original.insuranceStatus;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${insuranceStatusColor[status] || insuranceStatusColor.Default}20`,
              color: insuranceStatusColor[status] || insuranceStatusColor.Default,
            }}
          >
            {status}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "dateOfBirth",
      header: "Date of Birth",
      enableSorting: true,
    },
    {
      accessorKey: "age",
      header: "Age",
      enableSorting: true,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.original.gender;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${genderColor[gender] || genderColor.Default}20`,
              color: genderColor[gender] || genderColor.Default,
            }}
          >
            {gender}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm truncate max-w-[200px] block">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "numberOfEncounters",
      header: "Encounters",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.original.numberOfEncounters}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: isActive ? '#4caf5020' : '#f4433620',
              color: isActive ? '#4caf50' : '#f44336',
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
      enableSorting: true,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: tablePatients,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(table.getState().pagination);
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = table.getPageCount();

  // Handle back navigation
  const handleBack = () => {
    navigate("/claims-management");
  };

  // Handle refresh
  const handleRefresh = () => {
    loadEmergencyBillPatients();
  };

  // Handle row click to view patient details
  const handleRowClick = (patientId: string) => {
    navigate(`/emergency/claims/patients/${patientId}`);
  };

  // Show loading while waiting for user data
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="bg-white rounded-md flex flex-col mb-36">
          {/* Header */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  ← Back
                </Button>
                <FormHeader>Emergency Bill Patients</FormHeader>
              </div>
              <input
                type="text"
                placeholder="Search patients by name, hospital no., or phone"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  table.setColumnFilters([
                    {
                      id: "fullName",
                      value: e.target.value,
                    },
                    {
                      id: "hospitalNumber",
                      value: e.target.value,
                    },
                    {
                      id: "phoneNumber",
                      value: e.target.value,
                    },
                  ]);
                }}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="small" /> : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={handleRefresh} 
                className="mt-2 text-red-600 hover:text-red-700"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Content */}
          <div>
            {loading && !emergencyBillPatients ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : !providerId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Provider ID is required to view emergency bill patients
                </div>
              </div>
            ) : !claimId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Claim ID is missing. Please go back and select a claim.
                </div>
                <Button onClick={handleBack}>Back to Claims</Button>
              </div>
            ) : tablePatients.length === 0 ? (
              <EmptyState
                icon={<span className="text-2xl">🏥</span>}
                title="No emergency bill patients available"
                description={error ? "Failed to load patients" : "No patients found for this claim."}
                action={
                  <Button onClick={handleBack}>
                    ← Back to Claims
                  </Button>
                }
              />
            ) : (
              <>
                {/* Summary Stats */}
                <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Patients</span>
                      <span className="text-2xl font-semibold">{tablePatients.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Amount</span>
                      <span className="text-2xl font-semibold text-green-600">
                        {formatCurrency(tablePatients.reduce((sum, patient) => sum + patient.totalAmount, 0))}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Encounters</span>
                      <span className="text-2xl font-semibold">
                        {tablePatients.reduce((sum, patient) => sum + patient.numberOfEncounters, 0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Active Patients</span>
                      <span className="text-2xl font-semibold text-green-600">
                        {tablePatients.filter(p => p.isActive).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table - Fixed with horizontal scroll */}
                <div className="flex-1 lg:px-0 lg:mt-4">
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="border-y border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => handleRowClick(row.original.id)}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <span className="font-medium">
                                  No patients found
                                </span>
                                <span className="text-gray-500">
                                  Try adjusting your search criteria
                                </span>
                                <Button onClick={handleRefresh}>
                                  Refresh Data
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-end">
                  <Pagination
                    totalEntriesSize={table.getFilteredRowModel().rows.length}
                    currentPage={pageIndex + 1}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={(p) => setPageIndex(p - 1)}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPageIndex(0);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyClaimsDetails;