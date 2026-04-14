import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";

const ProtectedRoute = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;