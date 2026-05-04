import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../services/slices/authSlice";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    try {
      if (token && user) {
        dispatch(
          loginSuccess({
            token,
            user: JSON.parse(user),
          })
        );
      } else {
        dispatch(logout());
      }
    } catch {
      dispatch(logout());
    }

    setReady(true);
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="medium" color="text-red-500" />
      </div>
    );
  }

  return children;
};
