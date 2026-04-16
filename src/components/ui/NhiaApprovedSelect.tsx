import React, { useEffect, useState } from "react";
import SearchableSelect from "./SearchableSelect";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchNhiaApprovedProviders } from "../../services/thunks/nhiaApprovedThunk";
import type { NhiaApprovedItem } from "../../types/nhiaApproved";

interface NhiaApprovedSelectProps {
  value?: string;
  onChange: (item: NhiaApprovedItem) => void;
  error?: string;
}

const NhiaApprovedSelect: React.FC<NhiaApprovedSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const dispatch = useAppDispatch();
  const { data = [] } = useAppSelector((state) => state.nhiaApproved);

  const [search, setSearch] = useState("");

  // ✅ Debounced search (single source of truth)
  useEffect(() => {
    if (search.length < 3) return;

    const delay = setTimeout(() => {
      dispatch(fetchNhiaApprovedProviders(search));
    }, 400);

    return () => clearTimeout(delay);
  }, [search, dispatch]);

  const options = search.length >= 3
    ? data.map((item) => ({
        label: item.name,
        value: item.code,
        meta: item,
      }))
    : [];

  return (
    <SearchableSelect
      label="Search Hospital (NHIA Approved)"
      options={options}
      value={value}
      error={error}
      onInputChange={(input: string) => {
        setSearch(input);
      }}
      onSelect={(option) => {
        onChange(option.meta);
      }}
    />
  );
};

export default NhiaApprovedSelect;