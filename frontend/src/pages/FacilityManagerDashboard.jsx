import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Sparkles,
  LayoutDashboard,
  Building,
  LayoutGrid,
  Calendar,
  Wrench,
  BarChart3,
  Plus,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import FacilitySummaryCards from "../components/Facility/FacilitySummaryCards";
import FacilityOverview from "../components/Facility/FacilityOverview";
import MeetingRoomManagement from "../components/Facility/MeetingRoomManagement";
import WorkspaceManagement from "../components/Facility/WorkspaceManagement";
import MaintenanceManagement from "../components/Facility/MaintenanceManagement";
import FacilityReservations from "../components/Facility/FacilityReservations";
import FacilityAnalytics from "../components/Facility/FacilityAnalytics";

export default function FacilityManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Rooms, 2: Desks, 3: Reservations, 4: Maintenance, 5: Analytics
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal Signals
  const [triggerAddRoom, setTriggerAddRoom] = useState(false);
  const [triggerAddDesk, setTriggerAddDesk] = useState(false);
  const [triggerMaintenance, setTriggerMaintenance] = useState(false);

  const navTabs = [
    {
      id: 0,
      label: "Dashboard Overview",
      subtitle: "Real-time summary, quick operations, and facility health metrics.",
      icon: LayoutDashboard,
    },
    {
      id: 1,
      label: "Meeting Rooms",
      subtitle: "Configure meeting rooms, equipment, capacity, and active status.",
      icon: Building,
    },
    {
      id: 2,
      label: "Workspace Desks",
      subtitle: "Manage floor plans, focus desks, quiet pods, and zones.",
      icon: LayoutGrid,
    },
    {
      id: 3,
      label: "Master Reservations",
      subtitle: "Monitor employee meeting room & workspace reservations in real time.",
      icon: Calendar,
    },
    {
      id: 4,
      label: "Maintenance & Repairs",
      subtitle: "Track maintenance tickets, schedule repairs, and assign technicians.",
      icon: Wrench,
    },
    {
      id: 5,
      label: "Facility Analytics",
      subtitle: "In-depth insights into room utilization, desk occupancy, and facility trends.",
      icon: BarChart3,
    },
    {
      id: 6,
      label: "My Profile Settings",
      subtitle: "View personal credentials, edit account details, and settings.",
      icon: Settings,
    },
  ];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/facility/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Error loading facility dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentTabInfo = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAFAFA",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
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
          flexShrink: 0,
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
              boxShadow: "0 4px 14px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Sparkles size={18} color="#09090B" />
            <Typography
              variant="subtitle1"
              fontWeight={900}
              letterSpacing={-0.3}
              color="#09090B"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              IntraSphere
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Navigation Menu */}
        <Typography
          variant="caption"
          sx={{
            color: "#71717A",
            fontWeight: 700,
            px: 1.5,
            mb: 1,
            display: { xs: "none", md: "block" },
          }}
        >
          FACILITY PORTAL
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
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <IconComponent size={18} />
                  <Typography
                    variant="body2"
                    fontWeight="inherit"
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    {item.label}
                  </Typography>
                </Box>
                {isActive && (
                  <ChevronRight
                    size={16}
                    sx={{ display: { xs: "none", md: "block" } }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Quick Operations Section */}
        <Typography
          variant="caption"
          sx={{
            color: "#71717A",
            fontWeight: 700,
            px: 1.5,
            mb: 1,
            display: { xs: "none", md: "block" },
          }}
        >
          QUICK OPERATIONS
        </Typography>

        <Stack spacing={0.75}>
          <Box
            onClick={() => {
              setActiveTab(1);
              setTriggerAddRoom(true);
            }}
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
              "&:hover": { bgcolor: "#3F3F46" },
            }}
          >
            <Plus size={18} />
            <Typography
              variant="body2"
              fontWeight="inherit"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Add Meeting Room
            </Typography>
          </Box>

          <Box
            onClick={() => {
              setActiveTab(2);
              setTriggerAddDesk(true);
            }}
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
              "&:hover": { bgcolor: "#3F3F46" },
            }}
          >
            <Plus size={18} />
            <Typography
              variant="body2"
              fontWeight="inherit"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Add Workspace Desk
            </Typography>
          </Box>

          <Box
            onClick={() => {
              setActiveTab(4);
              setTriggerMaintenance(true);
            }}
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
              "&:hover": { bgcolor: "#3F3F46" },
            }}
          >
            <Wrench size={18} />
            <Typography
              variant="body2"
              fontWeight="inherit"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Log Maintenance
            </Typography>
          </Box>
        </Stack>

        {/* Logout at Bottom */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
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
              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.12)" },
            }}
          >
            <LogOut size={18} />
            <Typography
              variant="body2"
              fontWeight="inherit"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. MAIN WORKSPACE CANVAS AREA */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, md: 4 },
          overflowX: "hidden",
        }}
      >
        {/* Top Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color="#09090B"
              letterSpacing={-0.5}
            >
              {currentTabInfo.label}
            </Typography>
            <Typography variant="body2" color="#71717A" mt={0.25}>
              {currentTabInfo.subtitle}
            </Typography>
          </Box>

          {/* Right Header Action Icons & User Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                "&:hover": { bgcolor: "#F4F4F5" },
              }}
            >
              <Search size={18} color="#09090B" />
            </IconButton>

            <IconButton
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                "&:hover": { bgcolor: "#F4F4F5" },
              }}
            >
              <Bell size={18} color="#09090B" />
            </IconButton>

            <UserProfileHeader
              user={{ ...user, role: "Facility Manager" }}
              onLogout={handleLogout}
            />
          </Box>
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
                    color: isActive ? "#09090B" : "#52525B",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    boxShadow: isActive
                      ? "0 -4px 12px rgba(0,0,0,0.03)"
                      : "none",
                    "&:hover": {
                      bgcolor: isActive ? "#FFFFFF" : "#D4D4D8",
                    },
                  }}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </Box>
              );
            })}
          </Box>

          {/* Main White Canvas Content Container */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              bgcolor: "#FFFFFF",
              borderRadius: "0 16px 16px 16px",
              border: "1px solid #E4E4E7",
              p: { xs: 2.5, md: 3.5 },
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* TAB 0: DASHBOARD OVERVIEW */}
            {activeTab === 0 && (
              <Box>
                {loading ? (
                  <Box textAlign="center" py={8}>
                    <CircularProgress sx={{ color: "#1976D2" }} />
                  </Box>
                ) : (
                  <>
                    <FacilitySummaryCards stats={stats} loading={loading} />
                    <FacilityOverview
                      stats={stats}
                      onNavigateTab={(idx) => setActiveTab(idx)}
                      onOpenAddRoom={() => {
                        setActiveTab(1);
                        setTriggerAddRoom(true);
                      }}
                      onOpenAddDesk={() => {
                        setActiveTab(2);
                        setTriggerAddDesk(true);
                      }}
                      onOpenMaintenance={() => {
                        setActiveTab(4);
                        setTriggerMaintenance(true);
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* TAB 1: MEETING ROOMS */}
            {activeTab === 1 && (
              <MeetingRoomManagement
                openAddSignal={triggerAddRoom}
                onResetAddSignal={() => setTriggerAddRoom(false)}
                onRefreshStats={fetchStats}
              />
            )}

            {/* TAB 2: WORKSPACE DESKS */}
            {activeTab === 2 && (
              <WorkspaceManagement
                openAddSignal={triggerAddDesk}
                onResetAddSignal={() => setTriggerAddDesk(false)}
                onRefreshStats={fetchStats}
              />
            )}

            {/* TAB 3: RESERVATIONS */}
            {activeTab === 3 && (
              <FacilityReservations onRefreshStats={fetchStats} />
            )}

            {/* TAB 4: MAINTENANCE MANAGEMENT */}
            {activeTab === 4 && (
              <MaintenanceManagement
                openAddSignal={triggerMaintenance}
                onResetAddSignal={() => setTriggerMaintenance(false)}
                onRefreshStats={fetchStats}
              />
            )}

            {/* TAB 5: ANALYTICS */}
            {activeTab === 5 && <FacilityAnalytics />}

            {/* TAB 6: PROFILE MANAGEMENT */}
            {activeTab === 6 && <EmployeeProfileSection />}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
