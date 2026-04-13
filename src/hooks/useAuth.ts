import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../services/store/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  togglePasswordVisibility,
} from "../services/slices/authSlice";
import { authAPI } from "../services/api/authApi";
import type { OrganizationType, Role } from "../types/roles";

interface LoginCredentials {
  email: string;
  password: string;
}

const deriveOrgType = (data: any): OrganizationType => {
  if (data.isProvider) return "PROVIDER";
  if (data.organization === "SSHIA") return "SSHIA";
  if (data.role?.toLowerCase().includes("admin")) {
    return "Administrative";
  }
  return "Individual";
};

const normalizeRole = (role?: string): Role => {
  if (!role) return "INDIVIDUAL";
  
  const r = role.toLowerCase();
  
  // Provider roles
  if (r.includes("md")) return "MD";
  if (r.includes("provider")) return "PROVIDER";
  
  // Administrative
  if (r.includes("admin")) return "ADMINISTRATOR";
  
  // Organization types
  if (r.includes("sshia")) return "SSHIA";
  if (r.includes("nhia")) return "NHIA";
  if (r.includes("hmo")) return "HMO";
  if (r.includes("corporate")) return "CORPORATE";
  if (r.includes("individual")) return "INDIVIDUAL";
  
  // Default fallback
  return "INDIVIDUAL";
};

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    dispatch(loginStart());
    
    try {
      const response = await authAPI.login(credentials);
      console.log("RAW ORG TYPE:", response.data.orgType);

      if (response.isSuccess && response.data) {
        const dataWithPossibleAltToken =
          response.data as typeof response.data & { accessToken?: string };
        const token =
          response.token ||
          response.accessToken ||
          dataWithPossibleAltToken.token ||
          dataWithPossibleAltToken.accessToken;

        if (!token) {
          const msg = "Login succeeded but token missing in response";
          dispatch(loginFailure(msg));
          return { success: false, error: msg };
        }

        const user = {
          id: response.data.id,
          fullName: response.data.fullName,
          emailAddress: response.data.emailAddress,
          hmoId: response.data.hmoId,
          isProvider: response.data.isProvider,
          providerId: response.data.providerId,
          organization: response.data.organization,
          role: normalizeRole(response.data.role),
          orgType: deriveOrgType(response.data),
        };

        dispatch(loginSuccess({ token, user }));
        return { success: true };
      }

      const errorMessage = response.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  const resetError = () => {
    dispatch(clearError());
  };

  const togglePasswordVisible = () => {
    dispatch(togglePasswordVisibility());
  };

  return {
    ...authState,
    login,
    logout: signOut,
    clearError: resetError,
    togglePasswordVisibility: togglePasswordVisible,
  };
};