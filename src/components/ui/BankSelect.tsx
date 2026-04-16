import React, { useEffect } from "react";
import SearchableSelect from "./SearchableSelect";
import { useAppDispatch,useAppSelector } from "../../hooks/redux";
import { fetchBanks } from "../../services/thunks/bankThunk";
import type { BankType } from "../../types/bankType";

interface BankSelectProps {
  value?: string;
  onChange: (bank: BankType) => void;
  error?: string;
}

const BankSelect: React.FC<BankSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const dispatch = useAppDispatch();
//   const { banks } = useAppSelector((state) => state.banks);
const { banks = [] } = useAppSelector((state) => state.banks);

  useEffect(() => {
    if (!banks.length) {
      dispatch(fetchBanks());
    }
  }, [dispatch, banks.length]);

  const options = banks.map((bank) => ({
    label: bank.name,
    value: bank.id.toString(),
    meta: bank, 
  }));

  return (
    <SearchableSelect
      label="Bank Name"
      options={options}
      value={value}
      error={error}
      onSelect={(option) => {
        onChange(option.meta); 
      }}
    />
  );
};

export default BankSelect;