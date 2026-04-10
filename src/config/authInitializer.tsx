import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../services/slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // If token exists but user is missing → invalid state
    if (token && !user) {
      dispatch(logout());
      return;
    }

    // OPTIONAL: validate token expiry here if you have JWT
    // if (token is expired) → dispatch(logout())

  }, [dispatch]);

  return null;
};

export default AuthInitializer;