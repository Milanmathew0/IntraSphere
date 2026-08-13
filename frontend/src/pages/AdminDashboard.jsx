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
        backgroundColor: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header Banner */}
      <Box
        sx={{
          bgcolor: "#09090B",
          color: "#FFFFFF",
          pt: 1.5,
          pb: 4,
          px: { xs: 2, sm: 4, md: 6 },
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer" }} onClick={() => navigate("/")}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  bgcolor: "#18181B",
                  border: "1px solid #27272A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AdminPanelSettingsIcon style={{ color: "#FFFFFF" }} />
              </Box>
              <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} color="#FFFFFF">
                IntraSphere
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<MeetingRoomIcon />}
                onClick={() => navigate("/meeting-rooms")}
                sx={{
                  bgcolor: "#18181B",
                  color: "#FFFFFF",
                  border: "1px solid #27272A",
                  "&:hover": { bgcolor: "#27272A" },
                  fontWeight: 800,
                  borderRadius: "50px",
                  textTransform: "none",
                  px: 2.5,
                }}
              >
                Meeting Rooms
              </Button>

              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/employees")}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#09090B",
                  "&:hover": { bgcolor: "#F4F4F5" },
                  fontWeight: 800,
                  borderRadius: "50px",
                  textTransform: "none",
                  px: 2.5,
                }}
              >
                Employee Management
              </Button>

              <UserProfileHeader user={{ ...user, role: "Admin" }} onLogout={handleLogout} />
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main Content Container */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 6, flexGrow: 1 }}>
        {/* Welcome Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #E4E4E7",
            backgroundColor: "#FFFFFF",
            mb: 4,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Typography variant="h4" fontWeight="900" color="#09090B">
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

        {/* Tab 2: Leave Applications & Management */}
        {activeTab === 2 && (
          <Box textAlign="center" py={4}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/leave")}
              sx={{ borderRadius: "50px", px: 4, py: 1.5, bgcolor: "#064E3B", color: "#FFFFFF", fontWeight: 800 }}
            >
              Open Full Organization Leave Portal
            </Button>
          </Box>
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
