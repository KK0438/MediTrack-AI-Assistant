// src/components/PublicRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function PublicRoute({ children }) {
  const { user } = useContext(AppContext);

  // If user is logged in, redirect to Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;