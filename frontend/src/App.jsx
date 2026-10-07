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
import PerformancePage from "./pages/PerformancePage";
import AttendancePage from "./pages/AttendancePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes - Redirect to Landing Page with integrated Auth modal */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
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
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Facility Manager & Facility Management Routes */}
            <Route
              path="/facility-manager"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <FacilityManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-management"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-management/*"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />

            {/* Meeting Room Booking Route */}
            <Route
              path="/meeting-rooms"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <MeetingRooms />
                </ProtectedRoute>
              }
            />

            {/* Workspace / Desk Reservation Route */}
            <Route
              path="/workspaces"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <WorkspaceReservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace-reservation"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <WorkspaceReservation />
                </ProtectedRoute>
              }
            />

            {/* Leave Management Route */}
            <Route
              path="/leave"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <Leave />
                </ProtectedRoute>
              }
            />

            {/* Employee Management Route */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
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

            {/* Performance & Punctuality Routes */}
            <Route
              path="/performance-overview"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Feature Portal Direct Routes */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={["User", "Employee", "Manager", "HR", "Facility Manager", "Admin"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
