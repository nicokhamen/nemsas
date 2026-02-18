import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments, fetchServiceCategories } from "../../../../../services/thunks/departmentThunk";
import type { AppDispatch, RootState } from "../../../../../services/store/store";

export const useEmergencyBillData = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useSelector((state: RootState) => state.departments);

  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.serviceCategories
  );

  const hasFetchedDepartmentsRef = useRef(false);
  const hasFetchedCategoriesRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedDepartmentsRef.current && !departmentsLoading) {
      hasFetchedDepartmentsRef.current = true;
      dispatch(fetchDepartments());
    }

    if (!hasFetchedCategoriesRef.current && !categoriesLoading) {
      hasFetchedCategoriesRef.current = true;
      dispatch(fetchServiceCategories());
    }
  }, [dispatch, departmentsLoading, categoriesLoading]);

  return {
    departments,
    categories,
    departmentsLoading,
    categoriesLoading,
    departmentsError,
  };
};