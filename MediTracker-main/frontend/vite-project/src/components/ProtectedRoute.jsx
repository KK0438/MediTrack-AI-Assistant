import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AppContext);

  // ✅ Wait until user state is loaded
  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;