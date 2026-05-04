import { type Middleware, isAction } from "@reduxjs/toolkit";
import { useCustomToast } from "../../../hooks/useCustomToast";

export const toastMiddleware = (): Middleware => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_store) => (next) => (action: unknown) => {
    const { success, error, info } = useCustomToast();

    
    if (isAction(action) && typeof action === 'object' && action !== null) {
      switch (action.type) {
        case "auth/loginSuccess":
          success("Authenticated successfully");
          break;
        case "auth/loginFailure":
          // Type assertion for payload
         
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error((action as any).payload);
          break;
        case "auth/logout":
          info("Logout successfully");
          break;
        default:
          break;
      }
    }

    return next(action);
  };
};