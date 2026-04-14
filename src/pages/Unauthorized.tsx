import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {user && (
              <span className="block mt-2 text-sm">
                Current role: <strong>{user.role}</strong>
              </span>
            )}
          </p>
          <div className="space-x-4">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;