import React, { useState } from "react";
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

// Import Custom Dashboard Components
import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeHeader from "../components/dashboard/EmployeeHeader";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import EmployeeSummaryCards from "../components/dashboard/EmployeeSummaryCards";
import AttendanceOverview from "../components/dashboard/AttendanceOverview";
import EmployeeCalendar from "../components/dashboard/EmployeeCalendar";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import QuickActions from "../components/dashboard/QuickActions";
import UpcomingMeetings from "../components/dashboard/UpcomingMeetings";
import RecentAnnouncements from "../components/dashboard/RecentAnnouncements";
import EmployeeNotifications from "../components/dashboard/EmployeeNotifications";

// Tab Full Views
import LeaveApplicationCard from "../components/dashboard/LeaveApplicationCard";
import WorkspaceReservationCard from "../components/dashboard/WorkspaceReservationCard";
import EmergencyMeetingRooms from "../components/dashboard/EmergencyMeetingRooms";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleAttendanceChange = () => {
    setAttendanceRefreshKey((prev) => prev + 1);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F8FC", // Matching reference light canvas
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Left Dark Navy Sidebar */}
      <EmployeeSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* 2. Main Content Container */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <EmployeeHeader
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
          notificationsCount={3}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onNotificationClick={() => setActiveTab("notifications")}
        />

        {/* Dashboard Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flexGrow: 1 }}>
          {activeTab === "dashboard" && (
            <Stack spacing={2.5}>
              {/* BLOCK 1: TOP SECTION (Banner + 4 Summary Cards on Left | Calendar on Right) */}
              <Grid container spacing={2.5} alignItems="stretch">
                {/* Left Area (72.5% width): Banner + 4 Summary Cards */}
                <Grid xs={12} lg={8.7}>
                  <Stack spacing={2.5} sx={{ height: "100%", justifyContent: "space-between" }}>
                    <WelcomeBanner user={user} />
                    <EmployeeSummaryCards
                      user={user}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  </Stack>
                </Grid>

                {/* Right Area (27.5% width): Calendar */}
                <Grid xs={12} lg={3.3}>
                  <EmployeeCalendar />
                </Grid>
              </Grid>

              {/* BLOCK 2: MIDDLE ROW (Today's Schedule | Quick Actions | Upcoming Meetings) */}
              <Grid container spacing={2.5} alignItems="stretch">
                <Grid xs={12} md={6} lg={4.35}>
                  <TodaySchedule />
                </Grid>
                <Grid xs={12} md={6} lg={4.35}>
                  <QuickActions onActionClick={(id) => setActiveTab(id)} />
                </Grid>
                <Grid xs={12} lg={3.3}>
                  <UpcomingMeetings />
                </Grid>
              </Grid>

              {/* BLOCK 3: BOTTOM ROW (Attendance Overview | Recent Announcements | My Notifications) */}
              <Grid container spacing={2.5} alignItems="stretch">
                <Grid xs={12} md={6} lg={4.35}>
                  <AttendanceOverview
                    user={user}
                    onAttendanceChange={handleAttendanceChange}
                    showToast={showToast}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={4.35}>
                  <RecentAnnouncements />
                </Grid>
                <Grid xs={12} lg={3.3}>
                  <EmployeeNotifications />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* Sub-Tab Views for Dedicated Operations */}
          {activeTab === "attendance" && (
            <Stack spacing={3.5}>
              <AttendanceOverview
                user={user}
                onAttendanceChange={handleAttendanceChange}
                showToast={showToast}
              />
              <AttendanceHistoryTable
                user={user}
                refreshTrigger={attendanceRefreshKey}
              />
            </Stack>
          )}

          {activeTab === "leave" && (
            <Box>
              <LeaveApplicationCard />
            </Box>
          )}

          {activeTab === "meeting-rooms" && (
            <Stack spacing={3.5}>
              <EmergencyMeetingRooms />
            </Stack>
          )}

          {activeTab === "workspaces" && (
            <Stack spacing={3.5}>
              <WorkspaceReservationCard />
            </Stack>
          )}

          {activeTab === "my-bookings" && (
            <Stack spacing={3.5}>
              <UpcomingMeetings />
              <TodaySchedule />
            </Stack>
          )}

          {activeTab === "announcements" && (
            <Box sx={{ maxW: 900, mx: "auto" }}>
              <RecentAnnouncements />
            </Box>
          )}

          {activeTab === "notifications" && (
            <Box sx={{ maxW: 800, mx: "auto" }}>
              <EmployeeNotifications />
            </Box>
          )}

          {activeTab === "profile" && (
            <Box>
              <EmployeeProfileSection />
            </Box>
          )}
        </Box>
      </Box>

      {/* Global Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
