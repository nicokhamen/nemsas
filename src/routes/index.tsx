// AppRoutes.tsx
import { RouterProvider } from "react-router-dom";
import { ProviderProvider } from "../context/ProviderContext";
import { router } from "./router";
import AuthInitializer from "../config/authInitializer";

const AppRoutes = () => {
  return (
    <ProviderProvider>
      <AuthInitializer /> 
      <RouterProvider router={router} />
    </ProviderProvider>
  );
};

export default AppRoutes;