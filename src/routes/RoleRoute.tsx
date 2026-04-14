import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";
import type { Role } from "../types/roles";

interface RoleRouteProps {
  allowedRoles: Role[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // TypeScript now knows user.role is of type Role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;