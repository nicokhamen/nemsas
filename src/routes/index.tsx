// AppRoutes.tsx
import { RouterProvider } from "react-router-dom";
import { ProviderProvider } from "../context/ProviderContext";
import { router } from "./router";

const AppRoutes = () => {
  return (
    <ProviderProvider>
      <RouterProvider router={router} />
    </ProviderProvider>
  );
};

export default AppRoutes;