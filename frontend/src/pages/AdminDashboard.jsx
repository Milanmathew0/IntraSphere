import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
  Grid,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/BrandLogo";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import AttendanceWidget from "../components/dashboard/AttendanceWidget";
import EmergencyMeetingRooms from "../components/dashboard/EmergencyMeetingRooms";
import WorkspaceReservationCard from "../components/dashboard/WorkspaceReservationCard";
import LeaveApplicationCard from "../components/dashboard/LeaveApplicationCard";
import BookingHistoryTable from "../components/dashboard/BookingHistoryTable";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import OnboardingRequestsWidget from "../components/dashboard/OnboardingRequestsWidget";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || localStorage.getItem("email") || "Admin";
  const username = user?.username || email.split("@")[0];

  const [activeTab, setActiveTab] = useState(0);

  // Toast Notification State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, severity = "success") => {
    setToast({ open: true, message: msg, severity });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          color: "text.primary",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <BrandLogo size="medium" />

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/employees")}
                sx={{
                  bgcolor: "#7B1FA2",
                  "&:hover": { bgcolor: "#6A1B9A" },
                  fontWeight: 700,
                  borderRadius: "12px",
                  textTransform: "none",
                }}
              >
                Employee Management
              </Button>

              <UserProfileHeader user={{ ...user, role: "Admin" }} onLogout={handleLogout} />
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Container */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        {/* Welcome Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            mb: 4,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Typography variant="h4" fontWeight="bold" color="#1E293B">
                  Welcome, {username} 👋
                </Typography>
                <Chip
                  label="System Admin Portal"
                  sx={{
                    bgcolor: "#F3E5F5",
                    color: "#7B1FA2",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                />
              </Stack>

              <Typography variant="body1" color="text.secondary">
                Full System Administration Portal. Oversee company-wide attendance, manage employee directories, configure office rooms, and audit workspace reservations.
              </Typography>
            </Box>

            {/* Quick Summary Pill Badges */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              <Paper elevation={0} sx={{ p: 1.5, px: 2, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F1F5F9" }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total System Users
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" color="#7B1FA2">
                  128 Employees
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, px: 2, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F1F5F9" }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  System Health
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" color="#2E7D32">
                  ● 100% Operational
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabbed Navigation */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            mb: 4,
            px: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Admin Control Panel" sx={{ textTransform: "none", fontWeight: 600, py: 2 }} />
            <Tab icon={<MeetingRoomIcon />} iconPosition="start" label="Room & Desk Allocations" sx={{ textTransform: "none", fontWeight: 600, py: 2 }} />
            <Tab icon={<EventBusyIcon />} iconPosition="start" label="System Leave Records" sx={{ textTransform: "none", fontWeight: 600, py: 2 }} />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="All Booking Logs" sx={{ textTransform: "none", fontWeight: 600, py: 2 }} />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Admin Profile & Settings" sx={{ textTransform: "none", fontWeight: 600, py: 2 }} />
          </Tabs>
        </Paper>

        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <OnboardingRequestsWidget showToast={showToast} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <AttendanceWidget />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <EmergencyMeetingRooms />
            </Grid>
            <Grid item xs={12} md={6}>
              <WorkspaceReservationCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <LeaveApplicationCard />
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Room & Desk Bookings */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <EmergencyMeetingRooms />
            </Grid>
            <Grid item xs={12} md={6}>
              <WorkspaceReservationCard />
            </Grid>
            <Grid item xs={12}>
              <BookingHistoryTable />
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Leave Applications */}
        {activeTab === 2 && (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <LeaveApplicationCard />
            </Grid>
          </Grid>
        )}

        {/* Tab 3: History */}
        {activeTab === 3 && (
          <Box>
            <BookingHistoryTable />
          </Box>
        )}

        {/* Tab 4: Profile */}
        {activeTab === 4 && (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <EmployeeProfileSection />
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Footer */}
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
        <Typography variant="caption" color="text.secondary">
          © 2026 IntraSphere – Administrator Portal
        </Typography>
      </Box>

      {/* Snackbar Toast Feedback */}
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
