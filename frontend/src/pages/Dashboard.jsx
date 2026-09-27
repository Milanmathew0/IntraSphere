import React from "react";
import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard";
import FacilityManagerDashboard from "./FacilityManagerDashboard";

export default function Dashboard() {
  const { role } = useAuth();
  const userRole = role || localStorage.getItem("role") || "Employee";

  if (userRole === "Admin") {
    return <AdminDashboard />;
  }

  if (userRole === "Facility Manager") {
    return <FacilityManagerDashboard />;
  }

  if (userRole === "Manager") {
    return <ManagerDashboard />;
  }

  // Both "User" and "Employee" load the new Employee Dashboard Portal
  return <EmployeeDashboard />;
}
