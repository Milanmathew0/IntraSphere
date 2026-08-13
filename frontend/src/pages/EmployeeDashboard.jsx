import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
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
  IconButton
} from "@mui/material";
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  LayoutDashboard,
  Settings,
  Plus,
  Search,
  Bell,
  Download,
  ChevronDown,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import TodayAttendanceCard from "../components/dashboard/TodayAttendanceCard";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import TodayScheduleCard from "../components/dashboard/TodayScheduleCard";
import NotificationsCard from "../components/dashboard/NotificationsCard";
import EmergencyMeetingRooms from "../components/dashboard/EmergencyMeetingRooms";
import WorkspaceReservationCard from "../components/dashboard/WorkspaceReservationCard";
import LeaveApplicationCard from "../components/dashboard/LeaveApplicationCard";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || user?.email?.split("@")[0] || "Employee";

  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Attendance, 2: Leave, 3: Workspaces, 4: Profile
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [activeModal, setActiveModal] = useState(null); // 'meeting_room' | 'workspace' | 'leave' | null
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
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
      setActiveTab(1);
    } else if (actionId === "meeting_room") {
      navigate("/meeting-rooms");
    } else if (actionId === "workspace") {
      setActiveModal("workspace");
    } else if (actionId === "leave") {
      setActiveModal("leave");
    }
  };

  // Section Navigation Tabs Data (Deep Indigo/Violet Theme)
  const navTabs = [
    {
      id: 0,
      label: "My Dashboard & Overview",
      subtitle: "Personal attendance, schedule overview, and quick operations.",
      icon: LayoutDashboard,
      path: "/dashboard"
    },
    {
      id: 1,
      label: "Daily Attendance Log",
      subtitle: "Track check-in status and inspect your monthly attendance history.",
      icon: Clock,
      path: "/dashboard"
    },
    {
      id: 2,
      label: "My Leave Applications",
      subtitle: "Submit new leave requests and track your approval status.",
      icon: Calendar,
      path: "/leave"
    },
    {
      id: 3,
      label: "Workspaces & Rooms",
      subtitle: "Reserve quiet call pods, focus desks, and war room spaces.",
      icon: Building,
      path: "/meeting-rooms"
    },
    {
      id: 4,
      label: "My Profile Settings",
      subtitle: "View personal credentials and account details.",
      icon: Settings,
      path: "/dashboard"
    }
  ];

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
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const currentTabInfo = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. LEFT PERMANENT SIDEBAR (Jet Obsidian Black `#09090B`) */}
      <Box
        sx={{
          width: { xs: 80, md: 250 },
          bgcolor: "#09090B",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          boxShadow: "4px 0 25px rgba(0,0,0,0.12)",
          zIndex: 10,
          flexShrink: 0
        }}
      >
        {/* Brand Header Badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1 }}>
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              color: "#09090B",
              px: 2,
              py: 0.8,
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 4px 14px rgba(255, 255, 255, 0.2)"
            }}
          >
            <Sparkles size={18} color="#09090B" />
            <Typography variant="subtitle1" fontWeight={900} letterSpacing={-0.3} color="#09090B" sx={{ display: { xs: "none", md: "block" } }}>
              IntraSphere
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Navigation Menu */}
        <Typography variant="caption" sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}>
          EMPLOYEE PORTAL
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 4 }}>
          {navTabs.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;
            return (
              <Box
                key={item.id}
                onClick={() => {
                  if (item.id === 3 || item.path === "/meeting-rooms" || item.label.includes("Rooms") || item.label.includes("Workspace")) {
                    navigate("/meeting-rooms");
                  } else if (item.id === 2 || item.path === "/leave") {
                    navigate("/leave");
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.25,
                  borderRadius: "12px",
                  cursor: "pointer",
                  bgcolor: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "#09090B" : "#A1A1AA",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF"
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <IconComponent size={18} />
                  <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
                    {item.label}
                  </Typography>
                </Box>
                {isActive && <ChevronRight size={16} sx={{ display: { xs: "none", md: "block" } }} />}
              </Box>
            );
          })}
        </Stack>

        {/* Quick Operations Section */}
        <Typography variant="caption" sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}>
          QUICK REQUESTS
        </Typography>

        <Stack spacing={0.75}>
          <Box
            onClick={() => navigate("/meeting-rooms")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              bgcolor: "#27272A",
              border: "1px solid #3F3F46",
              "&:hover": { bgcolor: "#3F3F46" }
            }}
          >
            <Building size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Meeting Rooms
            </Typography>
          </Box>

          <Box
            onClick={() => setActiveModal("leave")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              bgcolor: "#27272A",
              border: "1px solid #3F3F46",
              "&:hover": { bgcolor: "#3F3F46" }
            }}
          >
            <Plus size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Apply for Leave
            </Typography>
          </Box>
        </Stack>

        {/* Logout at Bottom */}
        <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#EF4444",
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.12)" }
            }}
          >
            <LogOut size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. MAIN WORKSPACE CANVAS AREA */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, md: 4 }, overflowX: "hidden" }}>
        {/* Top Header Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#09090B" letterSpacing={-0.5}>
              {currentTabInfo.label}
            </Typography>
            <Typography variant="body2" color="#71717A" mt={0.25}>
              {currentTabInfo.subtitle}
            </Typography>
          </Box>

          {/* Right Header Action Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                "&:hover": { bgcolor: "#F4F4F5" }
              }}
            >
              <Search size={18} color="#09090B" />
            </IconButton>

            <IconButton
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                "&:hover": { bgcolor: "#F4F4F5" }
              }}
            >
              <Bell size={18} color="#09090B" />
            </IconButton>

            {/* Profile Chip / Avatar */}
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "50px",
                px: 1.5,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)"
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#09090B",
                  fontSize: "14px",
                  fontWeight: 700
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={700} color="#09090B">
                {username}
              </Typography>
              <ChevronDown size={14} color="#09090B" />
            </Box>
          </Box>
        </Box>

        {/* Hero Quick Stat Metrics Row */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5, mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Daily Attendance
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#09090B" mt={0.5}>
                PUNCHED IN
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#18181B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Clock size={22} />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Upcoming Bookings
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#09090B" mt={0.5}>
                {todayScheduleItems.length} Active
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#27272A",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Building size={22} />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Today's Date
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#09090B" mt={0.5}>
                {currentDateFormatted}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#3F3F46",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Calendar size={22} />
            </Box>
          </Paper>
        </Box>

        {/* 3. MAIN CARD WITH FOLDER-STYLE TABS (Black & White Aesthetics) */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Top Folder-Style Tab Bar */}
          <Box sx={{ display: "flex", gap: 1, px: 1, overflowX: "auto" }}>
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Box
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 3 || tab.path === "/meeting-rooms" || tab.label.includes("Rooms") || tab.label.includes("Workspace")) {
                      navigate("/meeting-rooms");
                    } else if (tab.id === 2 || tab.path === "/leave") {
                      navigate("/leave");
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: "14px 14px 0 0",
                    bgcolor: isActive ? "#FFFFFF" : "#E4E4E7",
                    color: isActive ? "#09090B" : "#52525B",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? "0 -2px 10px rgba(0, 0, 0, 0.03)" : "none",
                    border: isActive ? "1px solid #E4E4E7" : "1px solid transparent",
                    borderBottom: "none"
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>

          {/* Connected Main White Card Container */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "0 16px 16px 16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E4E4E7",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* TAB CONTENTS */}

            {/* Tab 0: Overview Summary Stack */}
            {activeTab === 0 && (
              <Stack spacing={3.5} sx={{ width: "100%" }}>
                {/* Attendance & Schedule Grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" }, gap: 3 }}>
                  <TodayAttendanceCard
                    user={user}
                    onAttendanceChange={handleAttendanceChange}
                    showToast={showToast}
                  />
                  <TodayScheduleCard scheduleItems={todayScheduleItems} />
                </Box>

                {/* Quick Actions Grid */}
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#09090B" mb={1.5}>
                    Quick Employee Operations
                  </Typography>
                  <QuickActionsGrid onActionClick={handleQuickAction} />
                </Box>

                {/* Attendance History Table & Notifications */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "8fr 4fr" }, gap: 3 }}>
                  <AttendanceHistoryTable user={user} refreshTrigger={historyRefreshTrigger} />
                  <NotificationsCard />
                </Box>
              </Stack>
            )}

            {/* Tab 1: Daily Attendance Log */}
            {activeTab === 1 && (
              <Stack spacing={3.5} sx={{ width: "100%" }}>
                <TodayAttendanceCard
                  user={user}
                  onAttendanceChange={handleAttendanceChange}
                  showToast={showToast}
                />
                <AttendanceHistoryTable user={user} refreshTrigger={historyRefreshTrigger} />
              </Stack>
            )}

            {/* Tab 2: My Leave Applications */}
            {activeTab === 2 && (
              <Box sx={{ width: "100%" }}>
                <LeaveApplicationCard />
              </Box>
            )}

            {/* Tab 3: Workspaces & Meeting Rooms */}
            {activeTab === 3 && (
              <Stack spacing={3.5} sx={{ width: "100%" }}>
                <WorkspaceReservationCard />
                <EmergencyMeetingRooms />
              </Stack>
            )}

            {/* Tab 4: My Profile Settings */}
            {activeTab === 4 && (
              <Box sx={{ width: "100%" }}>
                <EmployeeProfileSection />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Quick Action Modals */}
      <Dialog
        open={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#09090B" }}>
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
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, borderColor: "#09090B", color: "#09090B" }}
          >
            Close Window
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Toast Notification Snackbar */}
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
    </Box>
  );
}

