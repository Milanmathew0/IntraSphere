import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Grid,
  Button,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import api from "../api/axios";

// Admin Dashboard Components
import AdminSummaryCards from "../components/Admin/AdminSummaryCards";
import EmployeeOverview from "../components/Admin/EmployeeOverview";
import OnboardingOverview from "../components/Admin/OnboardingOverview";
import AttendanceOverview from "../components/Admin/AttendanceOverview";
import LeaveOverview from "../components/Admin/LeaveOverview";
import MeetingRoomOverview from "../components/Admin/MeetingRoomOverview";
import FacilityOverview from "../components/Admin/FacilityOverview";
import UserManagementSection from "../components/Admin/UserManagementSection";
import RecentActivity from "../components/Admin/RecentActivity";
import AdminAnalytics from "../components/Admin/AdminAnalytics";
import QuickActions from "../components/Admin/QuickActions";
import SystemHealth from "../components/Admin/SystemHealth";

// Modals
import ManageUsersModal from "../components/Admin/ManageUsersModal";
import AuditLogsModal from "../components/Admin/AuditLogsModal";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const email = user?.email || localStorage.getItem("email") || "admin@intrasphere.com";
  const username = user?.username || email.split("@")[0];

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, severity = "success") => {
    setToast({ open: true, message: msg, severity });
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/v1/admin/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
      try {
        const resFallback = await api.get("/api/v1/dashboard/admin");
        setDashboardData(resFallback.data);
      } catch (fallbackErr) {
        console.error("Fallback error loading admin stats:", fallbackErr);
        const errorMsg =
          err.response?.data?.detail ||
          fallbackErr.response?.data?.detail ||
          "Unable to load dashboard statistics. Please check backend connection.";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HEADER BANNER */}
      <Box
        sx={{
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          pt: 1.8,
          pb: 3.5,
          px: { xs: 2, sm: 4, md: 6 },
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Branding Logo */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
              onClick={() => navigate("/admin-dashboard")}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#1E293B",
                  border: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AdminPanelSettingsIcon style={{ color: "#38BDF8", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} color="#FFFFFF" sx={{ lineHeight: 1.2 }}>
                  IntraSphere
                </Typography>
                <Typography variant="caption" fontWeight={600} color="#94A3B8">
                  Admin Control Center
                </Typography>
              </Box>
            </Box>

            {/* Right Side Header Controls */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Refresh Stats">
                <IconButton onClick={fetchDashboardStats} sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="System Notifications">
                <IconButton sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<MeetingRoomIcon />}
                onClick={() => navigate("/meeting-rooms")}
                sx={{
                  bgcolor: "#1E293B",
                  color: "#FFFFFF",
                  border: "1px solid #334155",
                  "&:hover": { bgcolor: "#334155" },
                  fontWeight: 700,
                  borderRadius: "50px",
                  textTransform: "none",
                  px: 2.5,
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                Meeting Rooms
              </Button>

              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/employees")}
                sx={{
                  bgcolor: "#1976D2",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#1565C0" },
                  fontWeight: 700,
                  borderRadius: "50px",
                  textTransform: "none",
                  px: 2.5,
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                Employees
              </Button>

              <UserProfileHeader user={{ ...user, role: "Admin" }} onLogout={handleLogout} />
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* MAIN CONTENT CONTAINER */}
      <Container maxWidth="xl" sx={{ mt: 3.5, mb: 6, flexGrow: 1 }}>
        {/* Welcome Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            borderRadius: 3.5,
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            mb: 4,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.8}>
                <Typography variant="h4" fontWeight="900" color="#0F172A">
                  Admin Dashboard
                </Typography>
                <Chip label="Organization Control Center" sx={{ bgcolor: "#E3F2FD", color: "#1976D2", fontWeight: 700 }} />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                Centralized management and monitoring of IntraSphere office automation operations.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchDashboardStats}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Refresh Data
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchDashboardStats}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {/* 1. SUMMARY CARDS */}
        <Box sx={{ mb: 4 }}>
          <AdminSummaryCards data={dashboardData} loading={loading} />
        </Box>

        {/* 2. OVERVIEW SECTIONS (2-Column & 3-Column Responsive Grids) */}
        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <EmployeeOverview data={dashboardData} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <OnboardingOverview data={dashboardData} loading={loading} />
          </Grid>
        </Grid>

        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={6}>
            <AttendanceOverview
              data={dashboardData}
              loading={loading}
              onNavigateToAttendance={() => navigate("/employees")}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <LeaveOverview data={dashboardData} loading={loading} />
          </Grid>
        </Grid>

        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <MeetingRoomOverview data={dashboardData} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <UserManagementSection
              data={dashboardData}
              loading={loading}
              onOpenManageUsers={() => setManageUsersOpen(true)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FacilityOverview data={dashboardData} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentActivity
              data={dashboardData}
              loading={loading}
              onOpenAuditLogs={() => setAuditLogsOpen(true)}
            />
          </Grid>
        </Grid>

        {/* 3. ADMIN ANALYTICS */}
        <AdminAnalytics data={dashboardData} loading={loading} />

        {/* 4. QUICK ACTIONS */}
        <QuickActions
          onOpenAddEmployee={() => navigate("/employees")}
          onOpenManageUsers={() => setManageUsersOpen(true)}
          onOpenReports={() => showToast("Reports exported to system downloads folder.", "info")}
        />

        {/* 5. SYSTEM HEALTH */}
        <SystemHealth data={dashboardData} loading={loading} />
      </Container>

      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          py: 2.5,
          mt: "auto",
          textAlign: "center",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          © 2026 IntraSphere – Smart Office Management and Automation System | Administrator Control Center
        </Typography>
      </Box>

      {/* MODALS */}
      <ManageUsersModal
        open={manageUsersOpen}
        onClose={() => setManageUsersOpen(false)}
        onRefreshDashboard={fetchDashboardStats}
      />

      <AuditLogsModal
        open={auditLogsOpen}
        onClose={() => setAuditLogsOpen(false)}
      />

      {/* FEEDBACK TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
