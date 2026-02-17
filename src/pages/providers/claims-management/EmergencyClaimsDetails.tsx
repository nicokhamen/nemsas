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
import { fetchClaimsEmergencyBills } from "../../../services/thunks/claimEmergencyThunk";
import { clearCurrentEmergencyBills } from "../../../services/slices/claimEmergencyBillsSlice";

// Status color map for discharge status
const dischargeStatusColor: Record<string, string> = {
  Discharged: "#2e7d32",
  Admitted: "#1976d2",
  Transferred: "#ff9800",
  Deceased: "#d32f2f",
  Default: "#6b6f80",
};

// Insurance status color
const insuranceStatusColor: Record<string, string> = {
  NHIA: "#2196f3",
  Private: "#4caf50",
  'Self-Pay': "#9c27b0",
  Default: "#4caf50",
};

// Format currency
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _formatCurrency = (amount: number): string => {
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const EmergencyClaimsDetails = () => {
  const { id: claimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get providerId from auth context (similar to Claims component)
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerId = currentUser?.providerId || "";
  
  // Get emergency bills data from Redux store
  const { 
    data: emergencyBills,
    loading, 
    error,
    // currentEmergencyClaimId
  } = useSelector((state: RootState) => state.claimsEmergencyBills);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Load emergency bills when claimId and providerId are available
  const loadEmergencyBills = useCallback(() => {
    if (claimId && providerId) {
      dispatch(fetchClaimsEmergencyBills({ 
        emergencyClaimId: claimId, 
        providerId 
      }));
    }
  }, [dispatch, claimId, providerId]);

  // Load data on component mount or when IDs change
  useEffect(() => {
    if (claimId && providerId) {
      loadEmergencyBills();
    }
    
    // Clear data when component unmounts
    return () => {
      dispatch(clearCurrentEmergencyBills());
    };
  }, [dispatch, claimId, providerId, loadEmergencyBills]);

  // Map emergency bills to table format
  const tableBills = useMemo(() => {
    if (!emergencyBills?.data) return [];
    
    return emergencyBills.data.map((bill, index) => ({
      id: bill.id,
      sn: index + 1,
      patientName: `${bill.patient?.firstName || ''} ${bill.patient?.lastName || ''}`.trim(),
      patientHospitalNumber: bill.patient?.hospitalNumber || 'N/A',
      patientAge: bill.patient?.age || 'N/A',
      patientGender: bill.patient?.gender || 'N/A',
      patientInsuranceStatus: bill.patient?.insuranceStatus || 'N/A',
      hospitalName: bill.hospitalName,
      department: bill.department,
      serviceType: bill.serviceType,
      encounterStart: formatDate(bill.encounterStartDateTime),
      dischargeStatus: bill.dischargeStatus,
      dischargeDate: bill.dischargeDate ? formatDate(bill.dischargeDate) : 'N/A',
      attendingPhysician: bill.attendingPhysician || 'N/A',
      diagnosesCount: bill.diagnoses?.length || 0,
      servicesCount: bill.productServices?.length || 0,
      serviceCategories: bill.serviceCategories?.join(', ') || 'N/A',
      createdDate: formatDate(bill.createdDate),
      rawData: bill, // Keep raw data for potential expansion
    }));
  }, [emergencyBills]);

  // Define columns for the emergency bills table
  const columns: ColumnDef<(typeof tableBills)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      enableSorting: true,
    },
    // {
    //   accessorKey: "patientHospitalNumber",
    //   header: "Hospital No.",
    //   enableSorting: true,
    // },
    {
      accessorKey: "patientInsuranceStatus",
      header: "Insurance",
      cell: ({ row }) => {
        const status = row.original.patientInsuranceStatus;
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
      accessorKey: "hospitalName",
      header: "Hospital",
      enableSorting: true,
    },
    {
      accessorKey: "department",
      header: "Department",
      enableSorting: true,
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      enableSorting: true,
    },
    {
      accessorKey: "encounterStart",
      header: "Encounter Start",
      enableSorting: true,
    },
    {
      accessorKey: "dischargeStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.dischargeStatus;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${dischargeStatusColor[status] || dischargeStatusColor.Default}20`,
              color: dischargeStatusColor[status] || dischargeStatusColor.Default,
            }}
          >
            {status}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "attendingPhysician",
      header: "Physician",
      enableSorting: true,
    },
    {
      accessorKey: "diagnosesCount",
      header: "Diagnoses",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {row.original.diagnosesCount}
        </span>
      ),
    },
    {
      accessorKey: "servicesCount",
      header: "Services",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.original.servicesCount}
        </span>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: tableBills,
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
    loadEmergencyBills();
  };

  // Handle row click to view bill details
  const handleRowClick = (id: string) => {
    
    navigate(`/emergency/claims/bills/${id}`);
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
                {/* Claim #{claimId?.slice(0, 8)}... */}
                <FormHeader>Emergency Bills </FormHeader>
              </div>
              <input
                type="text"
                placeholder="Search bills by patient name or hospital"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  table.setColumnFilters([
                    {
                      id: "patientName",
                      value: e.target.value,
                    },
                    {
                      id: "hospitalName",
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
            {loading && !emergencyBills ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : !providerId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Provider ID is required to view emergency bills
                </div>
              </div>
            ) : !claimId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Claim ID is missing. Please go back and select a claim.
                </div>
                <Button onClick={handleBack}>Back to Claims</Button>
              </div>
            ) : tableBills.length === 0 ? (
              <EmptyState
                icon={<span className="text-2xl">🏥</span>}
                title="No emergency bills available"
                description={error ? "Failed to load bills" : "No bills found for this claim."}
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
                      <span className="text-sm text-gray-500">Total Bills</span>
                      <span className="text-2xl font-semibold">{tableBills.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Patients</span>
                      <span className="text-2xl font-semibold">
                        {new Set(tableBills.map(bill => bill.patientHospitalNumber)).size}
                      </span>
                    </div>
                    {/* <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Hospitals</span>
                      <span className="text-2xl font-semibold">
                        {new Set(tableBills.map(bill => bill.hospitalName)).size}
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 lg:px-0 lg:mt-4">
                  <Table className="min-w-[1200px]">
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
                                No bills found
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