import React from "react";
import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard";
import FacilityManagerDashboard from "./FacilityManagerDashboard";

export default function Dashboard() {
  const { role } = useAuth();
  const userRole = role || localStorage.getItem("role") || "User";

  if (userRole === "Admin") {
    return <AdminDashboard />;
  }

  if (userRole === "Facility Manager") {
    return <FacilityManagerDashboard />;
  }

  if (userRole === "Manager") {
    return <ManagerDashboard />;
  }

  if (userRole === "User") {
    return <UserDashboard />;
  }

  return <EmployeeDashboard />;
}
