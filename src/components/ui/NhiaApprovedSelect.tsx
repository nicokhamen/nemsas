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

  // 🔥 Trigger search only when >= 3 chars
  useEffect(() => {
    if (search.length >= 3) {
      dispatch(fetchNhiaApprovedProviders(search));
    }
  }, [search, dispatch]);

  const options = data.map((item) => ({
    label: item.name,
    value: item.code,
    meta: item,
  }));

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
      minSearchLength={3} // optional if your component supports it
    />
  );
};

export default NhiaApprovedSelect;