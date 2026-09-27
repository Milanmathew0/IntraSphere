import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CustomThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import MeetingRooms from "./pages/MeetingRooms";
import WorkspaceReservation from "./pages/WorkspaceReservation";
import FacilityManagerDashboard from "./pages/FacilityManagerDashboard";
import FacilityManagement from "./pages/FacilityManagement";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate-account" element={<ActivateAccount />} />

            {/* Unified & Role-specific Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Admin"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Facility Manager & Facility Management Routes */}
            <Route
              path="/facility-manager"
              element={
                <ProtectedRoute allowedRoles={["Facility Manager", "Admin"]}>
                  <FacilityManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-management"
              element={
                <ProtectedRoute allowedRoles={["Facility Manager", "Admin"]}>
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-management/*"
              element={
                <ProtectedRoute allowedRoles={["Facility Manager", "Admin"]}>
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />

            {/* Meeting Room Booking Route */}
            <Route
              path="/meeting-rooms"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <MeetingRooms />
                </ProtectedRoute>
              }
            />

            {/* Workspace / Desk Reservation Route */}
            <Route
              path="/workspaces"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <WorkspaceReservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace-reservation"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <WorkspaceReservation />
                </ProtectedRoute>
              }
            />

            {/* Leave Management Route */}
            <Route
              path="/leave"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Manager", "HR", "Admin"]}>
                  <Leave />
                </ProtectedRoute>
              }
            />

            {/* Employee Management Route (Restricted to Admin & Manager) */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />

            {/* Profile Route for all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Additional Employee Portal Direct Routes */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
