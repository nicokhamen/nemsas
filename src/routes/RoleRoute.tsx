import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";
import type { Role } from "../types/roles";
import type { ReactNode } from "react";

interface RoleRouteProps {
  allowedRoles: Role[];
  children?: ReactNode;
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  console.log("RoleRoute Check:", {
    userRole: user?.role,
    allowedRoles,
    hasAccess: user ? (user.role === "SuperAdmin" || allowedRoles.includes(user.role)) : false
  });

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // SuperAdmin can access everything
  if (user.role === "SuperAdmin") {
    return <>{children || <Outlet />}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    console.warn(`Access denied: Role "${user.role}" not in [${allowedRoles.join(", ")}]`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default RoleRoute;