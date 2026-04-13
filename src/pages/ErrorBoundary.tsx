import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";
  let status: number | null = null;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.statusText || title;
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          {status || "Error"}
        </h1>

        <h2 className="text-xl font-semibold mb-2">{title}</h2>

        <p className="text-gray-600 mb-6">{message}</p>

        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;