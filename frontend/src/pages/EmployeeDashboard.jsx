import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Import Custom Enterprise Components
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

// Modular tab panels for embedded full views
import LeaveApplicationCard from "../components/dashboard/LeaveApplicationCard";
import WorkspaceReservationCard from "../components/dashboard/WorkspaceReservationCard";
import EmergencyMeetingRooms from "../components/dashboard/EmergencyMeetingRooms";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";

const getInitialTab = (pathname) => {
  if (pathname.includes("/attendance")) return "attendance";
  if (pathname.includes("/leave")) return "leave";
  if (pathname.includes("/meeting-rooms")) return "meeting-rooms";
  if (pathname.includes("/workspaces") || pathname.includes("/workspace-reservation")) return "workspaces";
  if (pathname.includes("/my-bookings")) return "my-bookings";
  if (pathname.includes("/announcements")) return "announcements";
  if (pathname.includes("/notifications")) return "notifications";
  if (pathname.includes("/profile")) return "profile";
  return "dashboard";
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => getInitialTab(location.pathname));

  useEffect(() => {
    const tab = getInitialTab(location.pathname);
    setActiveTab(tab);
  }, [location.pathname]);

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [todayScheduleItems, setTodayScheduleItems] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  // Fetch today's schedule (meetings + desk bookings)
  useEffect(() => {
    let isMounted = true;
    const fetchTodayScheduleData = async () => {
      try {
        const [meetingRes, deskRes] = await Promise.allSettled([
          api.get("/api/v1/meeting-bookings/my"),
          api.get("/api/v1/workspace-reservations/my"),
        ]);

        const nowStr = new Date().toDateString();
        let items = [];
        let allBookingsList = [];

        if (meetingRes.status === "fulfilled" && Array.isArray(meetingRes.value.data)) {
          allBookingsList = [...allBookingsList, ...meetingRes.value.data];
          const todayMeetings = meetingRes.value.data
            .filter((b) => b.status !== "Cancelled" && new Date(b.start_time).toDateString() === nowStr)
            .map((b) => ({
              type: "meeting",
              title: b.title || b.room_name || "Meeting Room Booking",
              time: `${new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              location: `${b.room_name || "Conference Room"}${b.location ? " • " + b.location : ""}`,
              start_time: b.start_time,
            }));
          items = [...items, ...todayMeetings];
        }

        if (deskRes.status === "fulfilled" && Array.isArray(deskRes.value.data)) {
          allBookingsList = [...allBookingsList, ...deskRes.value.data];
          const todayDesks = deskRes.value.data
            .filter((b) => b.status !== "Cancelled" && new Date(b.start_time || b.reservation_date).toDateString() === nowStr)
            .map((b) => ({
              type: "workspace",
              title: b.desk_name || b.zone_name || "Workspace Desk Reservation",
              time: b.start_time
                ? `${new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Full Day Access",
              location: `Desk ${b.desk_number || "A-101"}${b.floor ? " • Floor " + b.floor : ""}`,
              start_time: b.start_time || b.reservation_date,
            }));
          items = [...items, ...todayDesks];
        }

        if (isMounted) {
          setTodayScheduleItems(items);
          setUserBookings(allBookingsList);
        }
      } catch (err) {
        console.error("Error fetching schedule data:", err);
      }
    };

    fetchTodayScheduleData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAttendanceChange = () => {
    setAttendanceRefreshKey((prev) => prev + 1);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F8FC", // Light blue/gray SaaS background
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

      {/* 2. Main Work Area Container */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top Header */}
        <EmployeeHeader
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
          notificationsCount={notificationsCount}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onNotificationClick={() => setActiveTab("notifications")}
        />

        {/* Dashboard Main Content Canvas */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          {/* Main Dashboard Overview View */}
          {activeTab === "dashboard" && (
            <Stack spacing={3.5}>
              {/* 1. Welcome Banner */}
              <WelcomeBanner user={user} />

              {/* 2. 4 Metric Summary Cards */}
              <EmployeeSummaryCards
                user={user}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              {/* 3. Multi-Column Grid */}
              <Grid container spacing={3.5}>
                {/* Left/Main Column (7.5/12 width on desktop) */}
                <Grid xs={12} lg={7.5}>
                  <Stack spacing={3.5}>
                    {/* Attendance Overview Card with Monthly Bar Chart & Live Punch */}
                    <AttendanceOverview
                      user={user}
                      onAttendanceChange={handleAttendanceChange}
                      showToast={showToast}
                    />

                    {/* Quick Actions (2x3 Grid) */}
                    <QuickActions onActionClick={(id) => setActiveTab(id)} />

                    {/* Upcoming Meetings List */}
                    <UpcomingMeetings />

                    {/* Recent Announcements */}
                    <RecentAnnouncements />
                  </Stack>
                </Grid>

                {/* Right Column (4.5/12 width on desktop) */}
                <Grid xs={12} lg={4.5}>
                  <Stack spacing={3.5}>
                    {/* Monthly Calendar Widget */}
                    <EmployeeCalendar bookings={userBookings} />

                    {/* Today's Schedule Timeline */}
                    <TodaySchedule scheduleItems={todayScheduleItems} />


                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* Sub-Tab Views for Dedicated Modules */}
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
              <TodaySchedule scheduleItems={todayScheduleItems} />
            </Stack>
          )}

          {activeTab === "announcements" && (
            <Box>
              <RecentAnnouncements />
            </Box>
          )}

          {activeTab === "notifications" && (
            <Box sx={{ maxW: 800, mx: "auto" }}>
              <EmployeeNotifications
                onUnreadCountChange={(cnt) => setNotificationsCount(cnt)}
              />
            </Box>
          )}

          {activeTab === "profile" && (
            <Box>
              <EmployeeProfileSection />
            </Box>
          )}
        </Box>
      </Box>

      {/* Global Toast Notification */}
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
