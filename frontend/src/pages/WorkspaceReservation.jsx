import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Calendar,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import AppLayout from "../components/layout/AppLayout";
import DeskCard from "../components/Workspace/DeskCard";
import DeskDetailsModal from "../components/Workspace/DeskDetailsModal";
import WorkspaceBookingModal from "../components/Workspace/WorkspaceBookingModal";
import MyWorkspaceReservations from "../components/Workspace/MyWorkspaceReservations";
import WorkspaceManagementModal from "../components/Workspace/WorkspaceManagementModal";
import WorkspaceAnalyticsModal from "../components/Workspace/WorkspaceAnalyticsModal";

const FACILITY_OPTIONS = [
  "Dual Monitors",
  "Ergonomic Chair",
  "Power Outlet",
  "USB-C Docking",
  "Standing Desk",
  "Quiet Zone",
  "Window View",
  "Near Coffee",
];

export default function WorkspaceReservation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0); // 0: Directory, 1: My Reservations, 2: Org Reservations (Admin)
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [floorFilter, setFloorFilter] = useState("All");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState("All");
  const [facilityFilter, setFacilityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Refresh Key Trigger State
  const [refreshKey, setRefreshKey] = useState(0);

  // Admin Org Reservations State
  const [allReservations, setAllReservations] = useState([]);
  const [loadingAllRes, setLoadingAllRes] = useState(false);

  // Modals State
  const [detailsModal, setDetailsModal] = useState({ open: false, desk: null });
  const [bookingModal, setBookingModal] = useState({ open: false, desk: null });
  const [mgmtModal, setMgmtModal] = useState({ open: false, desk: null });
  const [analyticsModal, setAnalyticsModal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/v1/workspaces/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching workspace stats:", err);
    }
  };

  const fetchDesks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (floorFilter !== "All") params.floor = Number(floorFilter);
      if (zoneFilter !== "All") params.zone = zoneFilter;
      if (workspaceTypeFilter !== "All") params.workspace_type = workspaceTypeFilter;
      if (facilityFilter !== "All") params.facility = facilityFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get("/api/v1/workspaces", { params });
      setDesks(res.data || []);
    } catch (err) {
      console.error("Error fetching desks:", err);
      showToast("Failed to load workspace desks", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    setLoadingAllRes(true);
    try {
      const res = await api.get("/api/v1/workspaces/reservations/all");
      setAllReservations(res.data || []);
    } catch (err) {
      console.error("Error loading org reservations:", err);
    } finally {
      setLoadingAllRes(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDesks();
  }, [selectedDate, floorFilter, zoneFilter, workspaceTypeFilter, facilityFilter, statusFilter, searchTerm, refreshKey]);

  useEffect(() => {
    if (activeTab === 2) {
      fetchAllReservations();
    }
  }, [activeTab]);

  const userRole = user?.role || "Employee";
  const isFacilityOrAdmin = ["Admin", "Facility Manager"].includes(userRole);

  const handleBookingSuccess = (msg) => {
    showToast(msg, "success");
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    fetchDesks();
  };

  const handleMgmtSuccess = (msg) => {
    showToast(msg, "success");
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    fetchDesks();
  };

  return (
    <AppLayout activeTabOverride="workspaces">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Main Title & Action Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              Workspace Reservation & Hot Desks
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.25}>
              Find and reserve a hot desk that suits your workday and productivity preferences.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant={activeTab === 1 ? "contained" : "outlined"}
              onClick={() => setActiveTab(1)}
              startIcon={<Calendar size={18} />}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                bgcolor: activeTab === 1 ? "#F97316" : "transparent",
                borderColor: "#E2E8F0",
                color: activeTab === 1 ? "#FFFFFF" : "#475569",
                "&:hover": { bgcolor: activeTab === 1 ? "#EA580C" : "#F8FAFC" },
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
                borderRadius: "10px",
                bgcolor: "#F97316",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                "&:hover": { bgcolor: "#EA580C" },
              }}
            >
              Reserve a Desk
            </Button>
          </Box>
        </Box>

        {/* SUMMARY STATS CARDS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
            mb: 3.5,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#64748B">
              AVAILABLE DESKS NOW
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#15803D" sx={{ my: 0.5 }}>
              {stats.available_now}
            </Typography>
            <Typography variant="caption" color="#15803D" fontWeight={600}>
              Ready for instant booking
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#64748B">
              RESERVED TODAY
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#F97316" sx={{ my: 0.5 }}>
              {stats.reserved_today}
            </Typography>
            <Typography variant="caption" color="#F97316" fontWeight={600}>
              Active confirmed bookings
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#64748B">
              MY UPCOMING RESERVATIONS
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#EA580C" sx={{ my: 0.5 }}>
              {stats.my_upcoming}
            </Typography>
            <Typography variant="caption" color="#EA580C" fontWeight={600}>
              Your personal bookings
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#64748B">
              TOTAL HOT DESKS
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
              {stats.total_desks}
            </Typography>
            <Typography variant="caption" color="#64748B" fontWeight={600}>
              Across all office floors & zones
            </Typography>
          </Paper>
        </Box>

        {/* MAIN NAVIGATION TABS */}
        <Paper elevation={0} sx={{ borderRadius: "14px", p: 0.8, mb: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.88rem",
                borderRadius: "10px",
                minHeight: 42,
                color: "#64748B",
                "&.Mui-selected": {
                  color: "#F97316",
                },
              },
            }}
          >
            <Tab label="Desk Directory & Availability" />
            <Tab label="My Workspace Reservations" />
            {isFacilityOrAdmin && (
              <Tab label="All Organization Reservations" />
            )}
          </Tabs>
        </Paper>

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
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(6, 1fr)",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

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

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search desk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
                  }}
                />
              </Box>
            </Paper>

            {/* DESK CARDS GRID */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={36} sx={{ color: "#F97316" }} />
              </Box>
            ) : desks.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: "16px",
                  border: "1px dashed #CBD5E1",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#0F172A" gutterBottom>
                  No available workspaces found.
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {desks.map((desk) => (
                  <DeskCard
                    key={desk.id}
                    desk={desk}
                    onSelectDetails={(d) => setDetailsModal({ open: true, desk: d })}
                    onSelectReserve={(d) => setBookingModal({ open: true, desk: d })}
                    onSelectEdit={(d) => setMgmtModal({ open: true, desk: d })}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* TAB 1: MY RESERVATIONS */}
        {activeTab === 1 && (
          <MyWorkspaceReservations refreshKey={refreshKey} showToast={showToast} />
        )}

        {/* TAB 2: ALL ORGANIZATION RESERVATIONS (ADMIN / FACILITY MANAGER) */}
        {activeTab === 2 && isFacilityOrAdmin && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Organization Workspace Reservations
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Complete master log of all hot-desk bookings across all employees.
                </Typography>
              </Box>
            </Box>

            {loadingAllRes ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={32} sx={{ color: "#F97316" }} />
              </Box>
            ) : allReservations.length === 0 ? (
              <Typography color="#64748B" textAlign="center" py={4}>
                No organization reservations recorded yet.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {allReservations.map((res) => (
                  <Paper
                    key={res.id}
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        {res.desk_code} – {res.desk_name}
                      </Typography>
                      <Chip label={res.status} size="small" color={res.status === "Confirmed" ? "success" : "default"} />
                    </Box>

                    <Typography variant="body2" fontWeight={700} color="#F97316">
                      Employee: {res.employee_name} ({res.employee_email})
                    </Typography>

                    <Typography variant="caption" color="#475569" display="block" sx={{ mt: 0.5 }}>
                      Date: {res.date} ({new Date(res.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date(res.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                    </Typography>

                    <Typography variant="caption" color="#64748B" display="block">
                      Floor {res.floor} • Zone: {res.zone} • Purpose: {res.purpose}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        )}
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
    </AppLayout>
  );
}
