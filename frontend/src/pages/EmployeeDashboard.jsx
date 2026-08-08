import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import EnterpriseHeader from "../components/dashboard/EnterpriseHeader";
import TodayAttendanceCard from "../components/dashboard/TodayAttendanceCard";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import TodayScheduleCard from "../components/dashboard/TodayScheduleCard";
import NotificationsCard from "../components/dashboard/NotificationsCard";

// Modal Component Imports for Quick Actions
import EmergencyMeetingRooms from "../components/dashboard/EmergencyMeetingRooms";
import WorkspaceReservationCard from "../components/dashboard/WorkspaceReservationCard";
import LeaveApplicationCard from "../components/dashboard/LeaveApplicationCard";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || user?.email?.split("@")[0] || "Employee";

  // Trigger state to refresh history table when today's attendance changes
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // Snackbar Toast State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Modal Dialog State for Quick Actions
  const [activeModal, setActiveModal] = useState(null); // 'meeting_room' | 'workspace' | 'leave' | null

  const showToast = (message, severity = "success") => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAttendanceChange = () => {
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === "attendance") {
      // Scroll to today's attendance card
      const elem = document.getElementById("today-attendance-section");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    } else if (actionId === "meeting_room") {
      setActiveModal("meeting_room");
    } else if (actionId === "workspace") {
      setActiveModal("workspace");
    } else if (actionId === "leave") {
      setActiveModal("leave");
    }
  };

  // Today's schedule items (mock/live backend response)
  const todayScheduleItems = [
    {
      type: "meeting",
      title: "Emergency War Room Alpha",
      time: "02:00 PM - 03:00 PM",
      location: "Building A - Floor 3",
    },
    {
      type: "workspace",
      title: "Silent Call Pod #A4 (Focus Desk)",
      time: "04:00 PM - 05:00 PM",
      location: "Quiet Zone B",
    },
  ];

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Header Navigation Bar */}
      <EnterpriseHeader user={user} onLogout={handleLogout} />

      {/* 2. Main Dashboard Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 6, flexGrow: 1 }}>
        {/* Welcome Hero Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            mb: 3,
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0F172A" mb={0.5}>
                Welcome back, {username} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                Enterprise Office Management Portal • Stay on top of your attendance, bookings, and schedules.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                px: 2,
                borderRadius: "12px",
                bgcolor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Calendar size={18} color="#2563EB" />
              <Typography variant="body2" fontWeight={700} color="#1E40AF">
                {currentDateFormatted}
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        {/* 3. Highest Priority Section: Today's Attendance & Today's Schedule */}
        <Grid container spacing={3} mb={3.5} id="today-attendance-section">
          {/* Today's Attendance (Main Card) */}
          <Grid item xs={12} lg={7}>
            <TodayAttendanceCard
              user={user}
              onAttendanceChange={handleAttendanceChange}
              showToast={showToast}
            />
          </Grid>

          {/* Today's Schedule */}
          <Grid item xs={12} lg={5}>
            <TodayScheduleCard scheduleItems={todayScheduleItems} />
          </Grid>
        </Grid>

        {/* 4. Quick Actions Grid */}
        <Box mb={3.5}>
          <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Quick Actions
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Frequent employee operations
            </Typography>
          </Box>
          <QuickActionsGrid onActionClick={handleQuickAction} />
        </Box>

        {/* 5. Attendance History Table & Notifications Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <AttendanceHistoryTable user={user} refreshTrigger={historyRefreshTrigger} />
          </Grid>

          <Grid item xs={12} lg={4}>
            <NotificationsCard />
          </Grid>
        </Grid>
      </Container>

      {/* 6. Quick Action Modals */}
      <Dialog
        open={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {activeModal === "meeting_room" && "Book a Meeting Room"}
          {activeModal === "workspace" && "Reserve Workspace Desk / Call Pod"}
          {activeModal === "leave" && "Apply for Leave"}
        </DialogTitle>
        <DialogContent dividers>
          {activeModal === "meeting_room" && <EmergencyMeetingRooms />}
          {activeModal === "workspace" && <WorkspaceReservationCard />}
          {activeModal === "leave" && <LeaveApplicationCard />}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setActiveModal(null)}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            Close Window
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Global Toast Notification Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "10px", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* 8. Footer */}
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
          © 2026 IntraSphere – Enterprise Smart Office System
        </Typography>
      </Box>
    </Box>
  );
}
