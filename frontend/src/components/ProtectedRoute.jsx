import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, hasRole } = useAuth();
  const token = localStorage.getItem("token") || isAuthenticated;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // If authenticated but unauthorized for this role, navigate to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}