// src/components/PublicRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function PublicRoute({ children }) {
  const { user } = useContext(AppContext);

  // If user is logged in, redirect to Home instead of Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;