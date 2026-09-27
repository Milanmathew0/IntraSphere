import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
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
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  BarChart3,
  Layers,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import DeskCard from "../components/Workspace/DeskCard";
import DeskDetailsModal from "../components/Workspace/DeskDetailsModal";
import WorkspaceBookingModal from "../components/Workspace/WorkspaceBookingModal";
import MyWorkspaceReservations from "../components/Workspace/MyWorkspaceReservations";
import WorkspaceManagementModal from "../components/Workspace/WorkspaceManagementModal";
import WorkspaceAnalyticsModal from "../components/Workspace/WorkspaceAnalyticsModal";

const FACILITY_OPTIONS = [
  "Monitor",
  "Dual Monitor",
  "Keyboard",
  "Mouse",
  "Docking Station",
  "USB-C",
  "Power Outlet",
  "Wi-Fi",
  "Ergonomic Chair",
  "Standing Desk",
];

export default function WorkspaceReservation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0); // 0: Directory, 1: My Reservations, 2: All Reservations (Admin/FM)
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Summary Stats
  const [stats, setStats] = useState({
    available_now: 0,
    reserved_today: 0,
    my_upcoming: 0,
    total_desks: 0,
  });

  // Filters State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [floorFilter, setFloorFilter] = useState("All");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState("All");
  const [facilityFilter, setFacilityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Refresh Key for child components
  const [refreshKey, setRefreshKey] = useState(0);

  // All organization reservations state (Admin/FM tab)
  const [allReservations, setAllReservations] = useState([]);
  const [loadingAllRes, setLoadingAllRes] = useState(false);

  // Modals state
  const [detailsModal, setDetailsModal] = useState({ open: false, desk: null });
  const [bookingModal, setBookingModal] = useState({ open: false, desk: null });
  const [mgmtModal, setMgmtModal] = useState({ open: false, desk: null });
  const [analyticsModal, setAnalyticsModal] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const userRole = user?.role || "Employee";
  const isFacilityOrAdmin = ["Admin", "Facility Manager"].includes(userRole);

  // Fetch summary counts
  const fetchSummaryStats = async () => {
    try {
      const res = await api.get("/api/v1/workspaces/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching workspace stats:", err);
    }
  };

  // Fetch desks directory
  const fetchDesks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (floorFilter !== "All") params.floor = Number(floorFilter);
      if (zoneFilter !== "All") params.zone = zoneFilter;
      if (workspaceTypeFilter !== "All") params.workspace_type = workspaceTypeFilter;
      if (facilityFilter !== "All") params.facility = facilityFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      if (selectedDate) params.date = selectedDate;

      const res = await api.get("/api/v1/workspaces/", { params });
      setDesks(res.data || []);
    } catch (err) {
      console.error("Error fetching desks:", err);
      showToast("Failed to load workspace desks", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all organization reservations for Admin/FM
  const fetchAllReservations = async () => {
    if (!isFacilityOrAdmin) return;
    setLoadingAllRes(true);
    try {
      const res = await api.get("/api/v1/workspace-reservations/all/");
      setAllReservations(res.data || []);
    } catch (err) {
      console.error("Error fetching all organization reservations:", err);
    } finally {
      setLoadingAllRes(false);
    }
  };

  useEffect(() => {
    fetchSummaryStats();
    fetchDesks();
  }, [searchTerm, floorFilter, zoneFilter, workspaceTypeFilter, facilityFilter, statusFilter, selectedDate, refreshKey]);

  useEffect(() => {
    if (activeTab === 2 && isFacilityOrAdmin) {
      fetchAllReservations();
    }
  }, [activeTab, isFacilityOrAdmin]);

  const handleBookingSuccess = (msg) => {
    showToast(msg, "success");
    setRefreshKey((prev) => prev + 1);
  };

  const handleMgmtSuccess = (msg) => {
    showToast(msg, "success");
    setRefreshKey((prev) => prev + 1);
  };

  const navTabs = [
    {
      id: 0,
      label: "My Dashboard & Overview",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: 1,
      label: "Daily Attendance Log",
      icon: Clock,
      path: "/dashboard",
    },
    {
      id: 2,
      label: "My Leave Applications",
      icon: Calendar,
      path: "/leave",
    },
    {
      id: 3,
      label: "Meeting Rooms",
      icon: Users,
      path: "/meeting-rooms",
    },
    {
      id: 4,
      label: "Workspace Desks",
      icon: Building,
      path: "/workspaces",
      active: true,
    },
    {
      id: 5,
      label: "My Profile Settings",
      icon: Settings,
      path: "/dashboard",
    },
  ];

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
          flexShrink: 0,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
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

        <Typography
          variant="caption"
          sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}
        >
          EMPLOYEE PORTAL
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 4 }}>
          {navTabs.map((item) => {
            const isActive = !!item.active;
            const IconComponent = item.icon;
            return (
              <Box
                key={item.id}
                onClick={() => navigate(item.path)}
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
                  <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
                    {item.label}
                  </Typography>
                </Box>
                {isActive && <ChevronRight size={16} sx={{ display: { xs: "none", md: "block" } }} />}
              </Box>
            );
          })}
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}
        >
          QUICK REQUESTS
        </Typography>

        <Stack spacing={0.75}>
          <Box
            onClick={() => setBookingModal({ open: true, desk: desks[0] || null })}
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
            <Plus size={16} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Reserve Desk
            </Typography>
          </Box>

          {isFacilityOrAdmin && (
            <>
              <Box
                onClick={() => setMgmtModal({ open: true, desk: null })}
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
                  bgcolor: "#1976D2",
                  "&:hover": { bgcolor: "#1565C0" },
                }}
              >
                <Wrench size={16} />
                <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
                  Add Hot Desk
                </Typography>
              </Box>

              <Box
                onClick={() => setAnalyticsModal(true)}
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
                <BarChart3 size={16} />
                <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
                  Workspace Utilization
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      {/* 2. MAIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top User Profile Header */}
        <UserProfileHeader />

        <Container maxWidth="xl" sx={{ mt: 3, mb: 6, px: { xs: 2, md: 4 } }}>
          {/* Main Title & Action Bar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={900} color="#09090B" letterSpacing={-0.5}>
                Workspace Reservation
              </Typography>
              <Typography variant="body1" color="#71717A" fontWeight={500}>
                Find and reserve a hot desk that suits your workday and productivity preferences.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant={activeTab === 1 ? "contained" : "outlined"}
                onClick={() => setActiveTab(1)}
                startIcon={<Calendar size={18} />}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  bgcolor: activeTab === 1 ? "#09090B" : "transparent",
                  borderColor: "#D4D4D8",
                  color: activeTab === 1 ? "#FFFFFF" : "#27272A",
                  "&:hover": { bgcolor: activeTab === 1 ? "#27272A" : "#F4F4F5" },
                }}
              >
                My Reservations ({stats.my_upcoming})
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  if (desks.length > 0) setBookingModal({ open: true, desk: desks[0] });
                  else showToast("No desks available to reserve.", "warning");
                }}
                startIcon={<Plus size={18} />}
                sx={{
                  borderRadius: "12px",
                  bgcolor: "#1976D2",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)",
                  "&:hover": { bgcolor: "#1565C0" },
                }}
              >
                Reserve a Desk
              </Button>
            </Box>
          </Box>

          {/* SUMMARY STATS CARDS */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  AVAILABLE DESKS NOW
                </Typography>
                <Typography variant="h4" fontWeight={900} color="#16A34A" sx={{ my: 0.5 }}>
                  {stats.available_now}
                </Typography>
                <Typography variant="caption" color="#16A34A" fontWeight={600}>
                  Ready for instant booking
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  RESERVED TODAY
                </Typography>
                <Typography variant="h4" fontWeight={900} color="#1976D2" sx={{ my: 0.5 }}>
                  {stats.reserved_today}
                </Typography>
                <Typography variant="caption" color="#1976D2" fontWeight={600}>
                  Active confirmed bookings
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  MY UPCOMING RESERVATIONS
                </Typography>
                <Typography variant="h4" fontWeight={900} color="#9333EA" sx={{ my: 0.5 }}>
                  {stats.my_upcoming}
                </Typography>
                <Typography variant="caption" color="#9333EA" fontWeight={600}>
                  Your personal bookings
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  TOTAL HOT DESKS
                </Typography>
                <Typography variant="h4" fontWeight={900} color="#09090B" sx={{ my: 0.5 }}>
                  {stats.total_desks}
                </Typography>
                <Typography variant="caption" color="#71717A" fontWeight={600}>
                  Across all floors & zones
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* MAIN NAVIGATION TABS */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="Desk Directory & Availability"
                sx={{ fontWeight: 700, textTransform: "none", fontSize: "16px" }}
              />
              <Tab
                label="My Workspace Reservations"
                sx={{ fontWeight: 700, textTransform: "none", fontSize: "16px" }}
              />
              {isFacilityOrAdmin && (
                <Tab
                  label="All Organization Reservations"
                  sx={{ fontWeight: 700, textTransform: "none", fontSize: "16px" }}
                />
              )}
            </Tabs>
          </Box>

          {/* TAB 0: DESK DIRECTORY & SEARCH */}
          {activeTab === 0 && (
            <Box>
              {/* FILTER BAR */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: "16px",
                  border: "1px solid #E4E4E7",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Date"
                      type="date"
                      fullWidth
                      size="small"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      label="Floor"
                      fullWidth
                      size="small"
                      value={floorFilter}
                      onChange={(e) => setFloorFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Floors</MenuItem>
                      <MenuItem value="1">Floor 1</MenuItem>
                      <MenuItem value="2">Floor 2</MenuItem>
                      <MenuItem value="3">Floor 3</MenuItem>
                      <MenuItem value="4">Floor 4</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      label="Zone"
                      fullWidth
                      size="small"
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Zones</MenuItem>
                      <MenuItem value="Engineering">Engineering</MenuItem>
                      <MenuItem value="Product & Design">Product & Design</MenuItem>
                      <MenuItem value="Executive">Executive Suite</MenuItem>
                      <MenuItem value="Finance">Finance & HR</MenuItem>
                      <MenuItem value="Atrium">Atrium</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      label="Workspace Type"
                      fullWidth
                      size="small"
                      value={workspaceTypeFilter}
                      onChange={(e) => setWorkspaceTypeFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="Standard Desk">Standard Desk</MenuItem>
                      <MenuItem value="Standing Desk">Standing Desk</MenuItem>
                      <MenuItem value="Quiet Desk">Quiet Desk</MenuItem>
                      <MenuItem value="Collaborative Desk">Collaborative Desk</MenuItem>
                      <MenuItem value="Executive Desk">Executive Desk</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      label="Facilities"
                      fullWidth
                      size="small"
                      value={facilityFilter}
                      onChange={(e) => setFacilityFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Facilities</MenuItem>
                      {FACILITY_OPTIONS.map((f) => (
                        <MenuItem key={f} value={f}>
                          {f}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search desk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search size={16} color="#71717A" style={{ marginRight: 8 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* DESK CARDS GRID */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress size={36} sx={{ color: "#1976D2" }} />
                </Box>
              ) : desks.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "16px",
                    border: "1px dashed #D4D4D8",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#09090B" gutterBottom>
                    No available workspaces found.
                  </Typography>
                  <Typography variant="body2" color="#71717A" sx={{ mb: 2 }}>
                    Try adjusting your filters, selecting a different date, or removing facility criteria.
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm("");
                      setFloorFilter("All");
                      setZoneFilter("All");
                      setWorkspaceTypeFilter("All");
                      setFacilityFilter("All");
                      setStatusFilter("All");
                    }}
                    sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                  >
                    Reset Filters
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {desks.map((desk) => (
                    <Grid item xs={12} sm={6} md={4} key={desk.id}>
                      <DeskCard
                        desk={desk}
                        onSelectDetails={(d) => setDetailsModal({ open: true, desk: d })}
                        onSelectReserve={(d) => setBookingModal({ open: true, desk: d })}
                        onSelectEdit={(d) => setMgmtModal({ open: true, desk: d })}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* TAB 1: MY RESERVATIONS */}
          {activeTab === 1 && (
            <MyWorkspaceReservations refreshKey={refreshKey} showToast={showToast} />
          )}

          {/* TAB 2: ALL ORGANIZATION RESERVATIONS (ADMIN / FACILITY MANAGER) */}
          {activeTab === 2 && isFacilityOrAdmin && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#09090B">
                    Organization Workspace Reservations
                  </Typography>
                  <Typography variant="caption" color="#71717A">
                    Complete master log of all hot-desk bookings across all employees.
                  </Typography>
                </Box>
              </Box>

              {loadingAllRes ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress size={32} sx={{ color: "#1976D2" }} />
                </Box>
              ) : allReservations.length === 0 ? (
                <Typography color="#71717A" textAlign="center" py={4}>
                  No organization reservations recorded yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {allReservations.map((res) => (
                    <Grid item xs={12} sm={6} key={res.id}>
                      <Paper
                        elevation={0}
                        sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E4E4E7", bgcolor: "#FAFAFA" }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#09090B">
                            {res.desk_code} – {res.desk_name}
                          </Typography>
                          <Chip label={res.status} size="small" color={res.status === "Confirmed" ? "success" : "default"} />
                        </Box>

                        <Typography variant="body2" fontWeight={700} color="#1976D2">
                          Employee: {res.employee_name} ({res.employee_email})
                        </Typography>

                        <Typography variant="caption" color="#52525B" display="block" sx={{ mt: 0.5 }}>
                          Date: {res.date} ({new Date(res.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(res.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </Typography>

                        <Typography variant="caption" color="#71717A" display="block">
                          Floor {res.floor} • Zone: {res.zone} • Purpose: {res.purpose}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* MODALS */}
      <DeskDetailsModal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, desk: null })}
        desk={detailsModal.desk}
        onReserve={(d) => setBookingModal({ open: true, desk: d })}
      />

      <WorkspaceBookingModal
        open={bookingModal.open}
        onClose={() => setBookingModal({ open: false, desk: null })}
        desk={bookingModal.desk}
        onBookingSuccess={handleBookingSuccess}
      />

      {isFacilityOrAdmin && (
        <>
          <WorkspaceManagementModal
            open={mgmtModal.open}
            onClose={() => setMgmtModal({ open: false, desk: null })}
            deskToEdit={mgmtModal.desk}
            onSuccess={handleMgmtSuccess}
          />

          <WorkspaceAnalyticsModal
            open={analyticsModal}
            onClose={() => setAnalyticsModal(false)}
          />
        </>
      )}

      {/* TOAST NOTIFICATION SNACKBAR */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: "12px", fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
