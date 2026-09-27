import React, { useState } from "react";
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

// Import Enterprise Reference Components
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

// Modular views for sub-tab navigation
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
        bgcolor: "#F4F7FC", // Match exact canvas background color
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
        notificationsCount={3}
      />

      {/* 2. Main Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top Header Bar */}
        <EmployeeHeader
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
          notificationsCount={3}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onNotificationClick={() => setActiveTab("notifications")}
        />

        {/* Dashboard Canvas Area */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flexGrow: 1 }}>
          {activeTab === "dashboard" && (
            <Grid container spacing={2.5}>
              {/* Left & Center Main Section (Width ~74% / 8.8 grid cols on desktop) */}
              <Grid xs={12} lg={8.8}>
                <Stack spacing={2.5}>
                  {/* Row 1: Welcome Banner */}
                  <WelcomeBanner user={user} />

                  {/* Row 2: 4 Summary Cards */}
                  <EmployeeSummaryCards
                    user={user}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />

                  {/* Row 3: Today's Schedule & Quick Actions */}
                  <Grid container spacing={2.5}>
                    <Grid xs={12} md={6}>
                      <TodaySchedule />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <QuickActions onActionClick={(id) => setActiveTab(id)} />
                    </Grid>
                  </Grid>

                  {/* Row 4: Attendance Overview (Bar Chart) & Recent Announcements */}
                  <Grid container spacing={2.5}>
                    <Grid xs={12} md={6}>
                      <AttendanceOverview
                        user={user}
                        onAttendanceChange={handleAttendanceChange}
                        showToast={showToast}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <RecentAnnouncements />
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>

              {/* Right Column Section (Width ~26% / 3.2 grid cols on desktop) */}
              <Grid xs={12} lg={3.2}>
                <Stack spacing={2.5}>
                  {/* Calendar Widget */}
                  <EmployeeCalendar />

                  {/* Upcoming Meetings */}
                  <UpcomingMeetings />

                  {/* My Notifications */}
                  <EmployeeNotifications />
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* Sub-Tab Embedded Views */}
          {activeTab === "attendance" && (
            <Stack spacing={3}>
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

          {activeTab === "leave" && <LeaveApplicationCard />}

          {activeTab === "meeting-rooms" && <EmergencyMeetingRooms />}

          {activeTab === "workspaces" && <WorkspaceReservationCard />}

          {activeTab === "my-bookings" && (
            <Stack spacing={3}>
              <UpcomingMeetings />
              <TodaySchedule />
            </Stack>
          )}

          {activeTab === "announcements" && <RecentAnnouncements />}

          {activeTab === "notifications" && (
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <EmployeeNotifications />
            </Box>
          )}

          {activeTab === "profile" && <EmployeeProfileSection />}
        </Box>
      </Box>

      {/* Global Toast Alert */}
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
