import { Navigate, useLocation } from "react-router-dom";
import Loader from "./Loader.jsx";
import { useAuth } from "../auth/useAuth.js";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page">
        <div className="loading-block">
          <Loader label="Loading session…" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
