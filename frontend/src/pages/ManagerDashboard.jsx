import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Grid,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton
} from "@mui/material";
import {
  Users,
  Calendar,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Building,
  Plus,
  Bell,
  Download,
  ChevronDown,
  Search,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import TeamPresenceWidget from "../components/dashboard/TeamPresenceWidget";
import TeamLeaveApprovalsWidget from "../components/dashboard/TeamLeaveApprovalsWidget";
import EmployeeDirectoryWidget from "../components/dashboard/EmployeeDirectoryWidget";
import AddEmployeeModal from "../components/Employee/AddEmployeeModal";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import api from "../api/axios";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || localStorage.getItem("email") || "Manager";
  const username = user?.username || email.split("@")[0];

  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Presence, 2: Leaves, 3: Directory, 4: Profile
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Unified Section Tabs Data (Guarantees 100% title consistency)
  const navTabs = [
    {
      id: 0,
      label: "Overview & Summary",
      subtitle: "Overview and administration of team requests, attendance, and member status.",
      icon: LayoutDashboard
    },
    {
      id: 1,
      label: "Team Presence",
      subtitle: "Live department headcount & daily attendance status.",
      icon: Building
    },
    {
      id: 2,
      label: "Leave Requests",
      subtitle: "Review and approve incoming workforce leave applications.",
      icon: Calendar
    },
    {
      id: 3,
      label: "Staff Directory",
      subtitle: "Oversee active workforce records and employee details.",
      icon: Users
    },
    {
      id: 4,
      label: "Manager Profile",
      subtitle: "Manage personal profile settings and account credentials.",
      icon: Settings
    }
  ];

  // Live Metrics State
  const [metrics, setMetrics] = useState({
    totalWorkforce: 0,
    presentPercentage: 93,
    pendingLeaves: 0,
    loading: true,
  });

  const fetchDashboardMetrics = async () => {
    try {
      const [empRes, attRes, pendRes] = await Promise.allSettled([
        api.get("/api/v1/employees"),
        api.get("/api/v1/attendance/today"),
        api.get("/api/v1/leave-requests/pending-approvals"),
      ]);

      let empList = [];
      if (empRes.status === "fulfilled" && empRes.value.data) {
        empList = empRes.value.data.employees || empRes.value.data || [];
      }

      let todayAttCount = 0;
      if (attRes.status === "fulfilled" && attRes.value.data) {
        todayAttCount = attRes.value.data.count || (attRes.value.data.attendance || []).length || 0;
      }

      let pendingCount = 0;
      if (pendRes.status === "fulfilled" && pendRes.value.data) {
        pendingCount = (pendRes.value.data || []).length;
      }

      const totalWorkforce = empList.length;
      const activeEmps = empList.filter(
        (e) => e.employment_status === "Active" || e.is_active !== false
      ).length;

      let presentPercentage = 0;
      if (totalWorkforce > 0) {
        presentPercentage = Math.round((todayAttCount / totalWorkforce) * 100);
      }

      setMetrics({
        totalWorkforce,
        presentPercentage,
        pendingLeaves: pendingCount,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching live metrics:", err);
      setMetrics((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

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

  const currentTabInfo = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. LEFT PERMANENT SIDEBAR */}
      <Box
        sx={{
          width: { xs: 80, md: 250 },
          bgcolor: "#09090B",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          boxShadow: "4px 0 25px rgba(0,0,0,0.08)",
          zIndex: 10,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1 }}>
          <Box
            sx={{
              bgcolor: "#18181B",
              border: "1px solid #27272A",
              px: 2,
              py: 0.8,
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShieldCheck size={18} color="#FFFFFF" />
            <Typography variant="subtitle1" fontWeight={900} letterSpacing={-0.3} color="#FFFFFF" sx={{ display: { xs: "none", md: "block" } }}>
              IntraSphere
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Navigation Menu */}
        <Typography variant="caption" sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}>
          MAIN MENU
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 4 }}>
          {navTabs.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;
            return (
              <Box
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
                  fontWeight: isActive ? 800 : 500,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "#18181B",
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

        {/* HR Operations Section */}
        <Typography variant="caption" sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}>
          QUICK ACTIONS
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
              fontWeight: 700,
              fontSize: "14px",
              bgcolor: "#18181B",
              border: "1px solid #27272A",
              "&:hover": { bgcolor: "#27272A" }
            }}
          >
            <Building size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Meeting Rooms
            </Typography>
          </Box>

          <Box
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              bgcolor: "#18181B",
              border: "1px solid #27272A",
              "&:hover": { bgcolor: "#27272A" }
            }}
          >
            <Plus size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Add Employee
            </Typography>
          </Box>
        </Stack>

        {/* Logout at Bottom */}
        <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid #27272A" }}>
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
              color: "#A1A1AA",
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { bgcolor: "#18181B", color: "#FFFFFF" }
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
        {/* Top Header Row (Title on left, Search/Bell/Avatar on right) */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900} color="#09090B" letterSpacing={-0.5}>
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
                color: "#09090B",
                "&:hover": { bgcolor: "#F4F4F5" }
              }}
            >
              <Search size={18} />
            </IconButton>

            <IconButton
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                color: "#09090B",
                "&:hover": { bgcolor: "#F4F4F5" }
              }}
            >
              <Bell size={18} />
            </IconButton>

            <UserProfileHeader user={{ ...user, role: "Manager" }} onLogout={handleLogout} />
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
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Total Workforce
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#09090B" mt={0.5}>
                {metrics.loading ? <CircularProgress size={24} sx={{ color: "#09090B" }} /> : metrics.totalWorkforce}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#F4F4F5",
                color: "#09090B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Users size={22} />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Daily Presence
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#09090B" mt={0.5}>
                {metrics.loading ? <CircularProgress size={24} sx={{ color: "#09090B" }} /> : `${metrics.presentPercentage}%`}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#F4F4F5",
                color: "#09090B",
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
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              border: "1px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                Pending Approvals
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#09090B" mt={0.5}>
                {metrics.loading ? <CircularProgress size={24} sx={{ color: "#09090B" }} /> : metrics.pendingLeaves}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#F4F4F5",
                color: "#09090B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Calendar size={22} />
            </Box>
          </Paper>
        </Box>

        {/* 3. MAIN CARD WITH FOLDER-STYLE TABS */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Top Folder-Style Tab Bar */}
          <Box sx={{ display: "flex", gap: 1, px: 1, overflowX: "auto" }}>
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Box
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: "14px 14px 0 0",
                    bgcolor: isActive ? "#FFFFFF" : "#E4E4E7",
                    color: isActive ? "#09090B" : "#71717A",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
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
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column"
            }}
          >


            {/* TAB CONTENTS */}

            {/* Tab 0: Overview Summary Stack (Vertical full-width layout) */}
            {activeTab === 0 && (
              <Stack spacing={3.5} sx={{ width: "100%" }}>
                <TeamPresenceWidget />
                <TeamLeaveApprovalsWidget showToast={showToast} />
              </Stack>
            )}

            {/* Tab 1: Team Presence */}
            {activeTab === 1 && (
              <Box sx={{ width: "100%" }}>
                <TeamPresenceWidget />
              </Box>
            )}

            {/* Tab 2: Leave Requests */}
            {activeTab === 2 && (
              <Box sx={{ width: "100%" }}>
                <TeamLeaveApprovalsWidget showToast={showToast} />
              </Box>
            )}

            {/* Tab 3: Staff Directory */}
            {activeTab === 3 && (
              <Box sx={{ width: "100%" }}>
                <EmployeeDirectoryWidget showToast={showToast} searchQuery={searchQuery} />
              </Box>
            )}

            {/* Tab 4: Manager Profile */}
            {activeTab === 4 && (
              <Box sx={{ width: "100%" }}>
                <EmployeeProfileSection />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Add Employee Modal Component */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDashboardMetrics();
          showToast("Employee added successfully!");
        }}
      />

      {/* Toast Feedback */}
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


