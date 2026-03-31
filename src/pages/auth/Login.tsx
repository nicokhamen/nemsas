import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/form/Input";
import { useForm } from "react-hook-form";
import type { LoginForm } from "../../types/LoginForm";
import { useAuth } from "../../hooks/useAuth";
import type { RootState } from "../../services/store/store";
import { useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import nemsasImage from "../../assets/nemsas.jpg";
import { LogIn } from "lucide-react";
import { normalizeOrgType } from "../../utils/normalizerOrg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, login, isAuthenticated, loading, clearError } = useAuth();

  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const [showPassword, setShowPassword] = useState(false);

  //  Determine redirect route BASED ON ROLE
  // const getRedirectPath = () => {
  //   if (!reduxUser) return "/login";

  //   if (reduxUser.orgType === "PROVIDER") {
  //     return "/emergency/bills";
  //   }

  //   return "/state/providers/all"; 
  // };
//   const getRedirectPath = () => {
//   if (!reduxUser) return "/login";
//   const orgType = normalizeOrgType(reduxUser.orgType);

//   switch (orgType) {
//     case "PROVIDER":
//       return "/emergency/bills";

//     case "SSHIA":
//       return "/state/providers/all";

//     case "ADMINISTRATIVE":
//       return "/dashboard";

//     default:
//       return "/login";
//   }
// };
const getRedirectPath = () => {
  if (!reduxUser) return "/login";

  const orgType = normalizeOrgType(reduxUser.orgType);
  const role = reduxUser.role;

  if (orgType === "PROVIDER") {
    if (role === "MD") return "/md-review"; 
    return "/emergency/bills";
  }

  if (orgType === "SSHIA") return "/state/providers/all";

  if (orgType === "ADMINISTRATIVE") return "/dashboard";

  return "/login";
};

  useEffect(() => {
    clearError();

    if (isAuthenticated && reduxUser) {
      navigate(getRedirectPath(), { replace: true });
    }

    return () => {
      clearError();
    };
  }, [isAuthenticated, reduxUser, navigate]);

  const onSubmit = async (data: LoginForm) => {
    const result = await login(data);

    if (result.success) {
      // Wait for redux to update, then redirect
      // (handled by useEffect)
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center space-x-2">
          <img src={nemsasImage} alt="NEMSAS Logo" className="w-8 h-8" />
          <h1 className="text-[#DC2626] font-semibold text-2xl">NEMSAS</h1>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-[#DC2626] text-xl font-semibold mb-6">
          LOGIN
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 mb-2">
              Email is required
            </p>
          )}

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true })}
            endAdornment={
              <span onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            }
          />

          <div className="flex items-center mb-4">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-[#DC2626] bg-transparent border border-[#DC2626] py-2 rounded-sm hover:bg-[#DC2626] hover:text-white transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <LogIn className="w-4 h-4" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Log in
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600 cursor-pointer hover:underline">
          Forgot your password?
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;