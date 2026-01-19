import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import FormHeader from "../../components/form/FormHeader";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAppDispatch } from "../../hooks/redux";
import { clearError } from "../../services/slices/emergencyClaimSlice";
import { fetchEmergencyClaims } from "../../services/thunks/emergencyClaimThunk";

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
} from "../../components/table";
import { Pagination } from "../../components/pagination";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/ui/DashboardCardItems/DashboardCard";

// Status color map
const statusColor: Record<string, string> = {
  Pending: "#ff9800",
  Processing: "#1976d2",
  Rejected: "#d32f2f",
  Approved: "#2e7d32",
  Paid: "#6b6f80",
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

export const MDReview = () => {
  const [providerId, setProviderId] = useState<string>("");
  const [sshiaId, setSshiaId] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get emergency claims from Redux store
  const { 
    claims: emergencyClaims, 
    loading, 
    error,
  } = useSelector((state: RootState) => state.emergencyClaim);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Initialize providerId and sshiaId from current user if available
  useEffect(() => {
    if (currentUser?.providerId) {
      setProviderId(currentUser.providerId);
      // If SSHIA ID is available from user, set it too
      if (currentUser.hmoId) {
        setSshiaId(currentUser.hmoId);
      }
    }
  }, [currentUser]);

  // Load claims when providerId and sshiaId are available
  const loadClaims = useCallback(() => {
    if (providerId && sshiaId) {
      dispatch(fetchEmergencyClaims({ providerId, SSHIAId: sshiaId }));
    }
  }, [dispatch, providerId, sshiaId]);

  // Load claims when component mounts or IDs change
  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Map emergency claims to table format
  const tableClaims = useMemo(() => {
    return (emergencyClaims || []).map((claim, index) => ({
      id: claim.id,
      sn: index + 1,
      description: claim.description,
      claimType: claim.claimType,
      date: formatDate(claim.date),
      rawDate: claim.date,
      submittedAmount: claim.submittedAmount,
      formattedAmount: formatCurrency(claim.submittedAmount),
      vettedAmount: claim.vettedAmount,
      formattedVettedAmount: formatCurrency(claim.vettedAmount),
      status: claim.status,
      createdDate: formatDate(claim.createdDate),
      emergencyBillCount: claim.emergencyBillIds?.length || 0,
    }));
  }, [emergencyClaims]);

  const routeToEmergencyBillPage = () => {
    navigate("/emergency/bill-capture");
  };

  // Handle navigation to MdReviewBills page when a claim is clicked
  const handleClaimClick = (claimId: string) => {
    navigate(`/md-review/${claimId}`);
  };

  // Define columns based on emergency claim schema
  const columns: ColumnDef<(typeof tableClaims)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: true,
    },
    {
      accessorKey: "claimType",
      header: "Claim Type",
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: "Claim Date",
      enableSorting: true,
    },
    {
      accessorKey: "formattedAmount",
      header: "Submitted Amount",
      enableSorting: true,
    },
    {
      accessorKey: "formattedVettedAmount",
      header: "Vetted Amount",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color: statusColor[row.original.status] || "#000",
            fontWeight: 600,
          }}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      enableSorting: true,
    },
         {
      id: "action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="h-auto py-1 px-3 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
           
            navigate(`/md-review/${row.original.id}`);
          }}
        >
          View
        </button>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: tableClaims,
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

  // Handle form submission for provider/SSHIA IDs
  const handleSubmitIds = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerId && sshiaId) {
      loadClaims();
    }
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
    <>
      <div className="p-6">
        <div className="bg-gray-100 overflow-scroll h-full">
          <div className="bg-white rounded-md flex flex-col mb-36">
            {/* Cards section */}
            <div className="flex flex-wrap gap-4 md:gap-6 p-6">
              <div className="w-full sm:w-auto flex-1 min-w-[250px]">
                <DashboardCard
                  indicatorColor="bg-blue-100 text-blue-600"
                  value={"1.4M"}
                  changeColor="text-red-500"
                  title="Total Amount"
                />
              </div>

              <div className="w-full sm:w-auto flex-1 min-w-[250px]">
                <DashboardCard
                  indicatorColor="bg-green-100 text-green-600"
                  value={89}
                  changeColor="text-green-500"
                  title="Total Patient"
                />
              </div>

              <div className="w-full sm:w-auto flex-1 min-w-[250px]">
                <DashboardCard
                  indicatorColor="bg-yellow-100 text-yellow-600"
                  value={"42%"}
                  changeColor="text-blue-500"
                  title="Bill Accuracy"
                />
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <div className="flex items-center gap-8">
                <FormHeader>All Claims</FormHeader>
                <input
                  type="text"
                  placeholder="Search claims by description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    table.setColumnFilters([
                      {
                        id: "description",
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
                  onClick={() => {
                    // Refresh claims
                    loadClaims();
                  }}
                >
                  Refresh
                </Button>
                <button
                  onClick={routeToEmergencyBillPage}
                  title="Create Emergency Bill"
                  className="text-red-600 bg-white hover:bg-gray-100 border border-red-600 px-3 py-2 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Provider/SSHIA ID Input Section */}
            {(!providerId || !sshiaId) && (
              <div className="px-6 pb-6 border-b">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Enter Provider and SSHIA IDs
                  </h3>
                  <form onSubmit={handleSubmitIds} className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">Provider ID</label>
                      <input
                        type="text"
                        value={providerId}
                        onChange={(e) => setProviderId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md min-w-64"
                        placeholder="Enter Provider ID"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">SSHIA ID</label>
                      <input
                        type="text"
                        value={sshiaId}
                        onChange={(e) => setSshiaId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md min-w-64"
                        placeholder="Enter SSHIA ID"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={!providerId || !sshiaId}>
                      Load Claims
                    </Button>
                  </form>
                  <p className="text-sm text-gray-500 mt-2">
                    These IDs are required to fetch emergency claims from the API.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">{error}</p>
                <Button 
                  onClick={loadClaims} 
                  className="mt-2 text-red-600 hover:text-red-700"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Content */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : !providerId || !sshiaId ? (
                <div className="text-center py-10">
                  <div className="text-gray-500 mb-4">
                    Please enter Provider ID and SSHIA ID to view claims
                  </div>
                </div>
              ) : tableClaims.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">📄</span>}
                  title="No emergency claims available"
                  description={error ? "Failed to load claims" : "No claims found for the provided IDs."}
                  action={
                    <Button onClick={routeToEmergencyBillPage}>
                      + Create New Emergency Claim
                    </Button>
                  }
                />
              ) : (
                <>
                  {/* Table */}
                  <div className="flex-1 lg:px-0 lg:mt-4">
                    <Table className="min-w-[1000px]">
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
                              onClick={() => handleClaimClick(row.original.id)}
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
                                  No claims found
                                </span>
                                <span className="text-gray-500">
                                  Try adjusting your search criteria
                                </span>
                                <Button onClick={routeToEmergencyBillPage}>
                                  + Create new claim
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
    </>
  );
};