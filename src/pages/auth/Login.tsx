import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/form/Input";
import { useForm } from "react-hook-form";
// import HimisLogo from "../../assets/himis-logo";

import type { LoginForm } from "../../types/LoginForm";
import { useAuth } from "../../hooks/useAuth";
import type { LocationWithState } from "../../types/route";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import nemsasImage from '../../assets/nemsas.jpg';
import { LogIn } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { login, isAuthenticated, loading, clearError } = useAuth();

  const location = useLocation() as LocationWithState;

  const [showPassword, setShowPassword] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();

    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, from, clearError]);

  const onSubmit = async (data: LoginForm) => {
    // console.log(data);
    const result = await login(data);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  if (isAuthenticated) {
    return null; 
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            {/* <HimisLogo /> */}
             <img src={nemsasImage} alt="NEMSAS Logo" className="w-8 h-8" />
            <h1 className="text-[#DC2626]-900 font-bold text-lg">NEMSAS</h1>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-center text-[#DC2626]-900 font-semibold mb-6">
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
                {errors.email.message}
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
  className="w-full flex items-center justify-center gap-2 text-[#DC2626] bg-transparent border border-[#DC2626] py-2 rounded-md hover:bg-[#DC2626] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      Login
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
