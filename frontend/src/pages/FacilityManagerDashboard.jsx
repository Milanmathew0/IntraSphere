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
import AppLayout from "../components/layout/AppLayout";
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
    <AppLayout activeTabOverride="facility">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              Facility Management – {currentTabInfo.label}
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.25}>
              {currentTabInfo.subtitle}
            </Typography>
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
                    <CircularProgress sx={{ color: "#10B981" }} />
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
    </AppLayout>
  );
}
