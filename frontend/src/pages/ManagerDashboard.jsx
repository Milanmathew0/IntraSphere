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
import AppLayout from "../components/layout/AppLayout";

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
    <AppLayout activeTabOverride="dashboard">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Title Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              Manager Portal – {currentTabInfo.label}
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.25}>
              {currentTabInfo.subtitle}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              borderRadius: "10px",
              px: 2.5,
              py: 1,
              bgcolor: "#1976D2",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": { bgcolor: "#1565C0" },
            }}
          >
            Add Employee
          </Button>
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
    </AppLayout>
  );
}


