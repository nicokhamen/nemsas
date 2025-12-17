import type { FilterFn } from "@tanstack/react-table";

export const patientNameFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const search = String(filterValue).toLowerCase().trim();
  if (!search) return true;

  const fullName = String(row.getValue(columnId)).toLowerCase();

  return fullName.includes(search);
};
