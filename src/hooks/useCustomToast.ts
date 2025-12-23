import { toast, type ToastOptions } from "react-toastify";

export const useCustomToast = () => {
  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,

      style: {
         
        background: "#0c560bff",
        color: "#ffffff",
        border: "none",
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontSize: "0.8125rem",
        fontWeight: "500",
        padding: "0.5rem 0.875rem",
        margin: "0.375rem 0",
        maxWidth: "320px",
        minHeight: "44px",
        lineHeight: "1.4",
      },
      className: "",
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: "#dc2626",
        color: "#ffffff",
        border: "none",
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontSize: "0.8125rem",
        fontWeight: "500",
        padding: "0.5rem 0.875rem",
        margin: "0.375rem 0",
        maxWidth: "320px",
        minHeight: "44px",
        lineHeight: "1.4",
      },
      className: "",
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontSize: "0.875rem",
        fontWeight: "500",
        padding: "0.75rem 1rem",
        margin: "0.5rem 0",
      },
      className: "",
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: "#d97706",
        color: "#ffffff",
        border: "none",
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontSize: "0.875rem",
        fontWeight: "500",
        padding: "0.75rem 1rem",
        margin: "0.5rem 0",
      },
      className: "",
    });
  };

  return {
    success,
    error,
    info,
    warning,
    dismiss: toast.dismiss,
    isActive: toast.isActive,
  };
};
