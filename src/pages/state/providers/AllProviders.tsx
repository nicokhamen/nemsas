import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Eye, Share, Search } from "lucide-react";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import FormHeader from "../../../components/form/FormHeader";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useAppSelector, useAppDispatch } from "../../../hooks/redux";

import { useProviderContext } from "../../../context/useProviderContext";

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
import { useNavigate } from "react-router-dom";

// Files export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../../utils/pdfFont";
import { getProviders } from "../../../services/thunks/stateProviderThunk";
import ProviderDetailsModal from "./ProviderDetailsModal";

// Define Provider type based on the schema
interface Provider {
  id: string;
  hospitalName: string;
  code: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: string;
  bankVeririfationNumber: string;
  stateLicenseNumber: string;
  licenseExpiryDate: string;
  geoLocation: string;
  stateId: string;
  organizationId: string;
  providerType: string;
  contacts: Array<{
    name: string;
    designation: string;
    email: string;
    phoneNumber: string;
  }>;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
  apiKey: string;
}

// Custom filter function for searching across multiple fields
const multiFieldFilter = (row: any, _columnId: string, filterValue: string) => {
  if (!filterValue) return true;

  const searchTerm = filterValue.toLowerCase();
  const hospitalName = (row.getValue("hospitalName") || "").toLowerCase();
  const email = (row.getValue("email") || "").toLowerCase();
  const location = (row.getValue("location") || "").toLowerCase();
  const licenseNumber = (row.getValue("licenseNumber") || "").toLowerCase();

  return (
    hospitalName.includes(searchTerm) ||
    email.includes(searchTerm) ||
    location.includes(searchTerm) ||
    licenseNumber.includes(searchTerm)
  );
};

// Format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};

// Export to PDF function
const exportTableToPDF = (tableData: any[], fileName = "providers.pdf") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("Roboto", "normal");

  doc.setFontSize(16);
  doc.text("Providers Report", 14, 12);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 18);

  const rows = tableData.map((provider, i) => {
    return [
      i + 1,
      provider.hospitalName || "N/A",
      provider.email || "N/A",
      provider.phoneNumber || "N/A",
      provider.location || "N/A",
      provider.licenseNumber || "N/A",
      provider.isActive ? "Active" : "Inactive",
    ];
  });

  autoTable(doc, {
    startY: 24,
    head: [
      [
        "S/N",
        "Hospital Name",
        "Email",
        "Phone Number",
        "Location",
        "License Number",
        "Active",
      ],
    ],
    body: rows,
    styles: {
      font: "Roboto",
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 45 },
      5: { cellWidth: 45 },
    },
    theme: "grid",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: 255,
    },
  });

  doc.save(fileName);
};

export const AllProviders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("Active");

  const providersState = useAppSelector((state: any) => state.createProvider);
  const providers = providersState?.providers || [];
  const loading = providersState?.loading || false;
  const error = providersState?.error || null;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { selectedProviderId } = useProviderContext();

  const [localProviders, setLocalProviders] = useState<Provider[]>([]);

  // Handle status update - Update local state immediately
  const handleStatusUpdate = (providerId: string, isActive: boolean) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, isActive } : p)),
    );

    // also update modal
    setSelectedProvider((prev) => (prev ? { ...prev, isActive } : prev));
  };

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  const routeToCreateProvider = () => {
    navigate("/state/provider/registration");
  };

  const loadProviders = useCallback(() => {
    dispatch(getProviders());
  }, [dispatch]);

  useEffect(() => {
    setLocalProviders(providers);
  }, [providers]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // Map providers to table format - this will re-run when providers change
  const tableProviders = useMemo(() => {
    return (localProviders || []).map((provider, index) => ({
      id: provider.id || `provider-${index}`,
      sn: index + 1,
      hospitalName: provider.hospitalName || "N/A",
      email: provider.email || "N/A",
      phoneNumber: provider.phoneNumber || "N/A",
      location: provider.hospitalAdress || "N/A",
      licenseNumber: provider.stateLicenseNumber || "N/A",
      isActive: provider.isActive,
      rawProvider: provider,
    }));
  }, [localProviders]);

  const columns: ColumnDef<(typeof tableProviders)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "hospitalName",
      header: "Hospital Name",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      enableSorting: true,
    },
    {
      accessorKey: "location",
      header: "Location",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      filterFn: (row, columnId, value) => {
        if (value === undefined) return true;
        return row.getValue(columnId) === value;
      },
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      accessorKey: "licenseNumber",
      header: "License Number",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      id: "action",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleViewProvider(row.original.rawProvider);
          }}
          title="View Provider"
        >
          <Eye className="h-5 w-5" />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: tableProviders,
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

  useEffect(() => {
    if (statusFilter === "All") {
      table.getColumn("isActive")?.setFilterValue(undefined);
    } else {
      table.getColumn("isActive")?.setFilterValue(statusFilter === "Active");
    }
  }, [statusFilter, table]);

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
            {/* Filters */}
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Filter By
              </h3>
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name/Provider
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search name or provider ..."
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        table.getColumn("hospitalName")?.setFilterValue(value);
                      }}
                      className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="All">All</option>
                  </select>
                </div>

                <div className="col-span-2"></div>

                <div className="col-span-3 flex gap-3">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("Active");
                      table.setColumnFilters([]);
                      loadProviders();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      loadProviders();
                    }}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Apply filter
                  </button>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center py-6 px-6 bg-gray-50">
              <label className="text-lg font-semibold text-gray-700">
                All Providers
              </label>
              <div className="flex gap-4 items-center">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => exportTableToPDF(tableProviders)}
                    className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition"
                  >
                    <Share className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-10">
                  <div>{error}</div>
                  <Button onClick={loadProviders} className="mt-4">
                    Retry Loading Providers
                  </Button>
                </div>
              ) : tableProviders.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">🏥</span>}
                  title="No providers available yet"
                  description="No providers found in the system."
                  action={
                    <Button onClick={routeToCreateProvider}>
                      + Create a new Provider
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="flex-1 lg:px-0 lg:mt-4">
                    <Table className="min-w-[800px]">
                      <TableHeader className=" bg-[#E4F7F1] hover:bg-[#E4F7F1] transition-colors">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow
                            key={headerGroup.id}
                            className="hover:bg-[#E4F7F1] transition-colors border-b border-[#E4F7F1]"
                          >
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
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
                              className="cursor-pointer hover:bg-[#FFFFFF] transition-colors"
                              onClick={() => {
                                handleViewProvider(row.original.rawProvider);
                              }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center hover:bg-[#FFFFFF] transition-colors"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <span className="font-medium">
                                  No providers found
                                </span>
                                <span className="font-medium">
                                  Try adjusting your search criteria
                                </span>
                                <Button onClick={routeToCreateProvider}>
                                  + Create new provider
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

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

      {isModalOpen && selectedProvider && (
        <ProviderDetailsModal
          provider={selectedProvider}
          onClose={handleCloseModal}
          onStatusChange={handleStatusUpdate}
        />
      )}
    </>
  );
};
