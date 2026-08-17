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
  Bell,
  ChevronRight,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import RoomCard from "../components/MeetingRooms/RoomCard";
import RoomDetailsModal from "../components/MeetingRooms/RoomDetailsModal";
import BookingModal from "../components/MeetingRooms/BookingModal";
import RoomCalendar from "../components/MeetingRooms/RoomCalendar";
import MyBookings from "../components/MeetingRooms/MyBookings";
import RoomManagementModal from "../components/MeetingRooms/RoomManagementModal";

export default function MeetingRooms() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0); // 0: Directory, 1: Schedule, 2: My Bookings, 3: Room Management
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Summary Stats
  const [stats, setStats] = useState({
    available_now: 0,
    booked_today: 0,
    my_upcoming: 0,
    total_rooms: 0,
  });

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Refresh Trigger State
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals State
  const [detailsModal, setDetailsModal] = useState({ open: false, room: null, booking: null });
  const [bookingModal, setBookingModal] = useState({
    open: false,
    room: null,
    prefillDate: null,
    prefillStartTime: null,
  });
  const [roomMgmtModal, setRoomMgmtModal] = useState({ open: false, room: null });

  // Toast Notification
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchSummaryStats = async () => {
    try {
      const res = await api.get("/api/v1/meeting-rooms/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching room stats:", err);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (minCapacity) params.min_capacity = Number(minCapacity);
      if (locationFilter !== "All") params.location = locationFilter;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/api/v1/meeting-rooms/", { params });
      setRooms(res.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      showToast("Failed to load meeting rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryStats();
    fetchRooms();
  }, [searchTerm, minCapacity, locationFilter, statusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userRole = user?.role || "Employee";
  const isFacilityOrAdmin = ["Admin", "Facility Manager"].includes(userRole);

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Sidebar Menu Items matching Dashboard
  const navTabs = [
    {
      id: 0,
      label: "My Dashboard & Overview",
      subtitle: "Personal attendance, schedule overview, and quick operations.",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: 1,
      label: "Daily Attendance Log",
      subtitle: "Track check-in status and inspect your monthly attendance history.",
      icon: Clock,
      path: "/dashboard",
    },
    {
      id: 2,
      label: "My Leave Applications",
      subtitle: "Submit new leave requests and track your approval status.",
      icon: Calendar,
      path: "/leave",
    },
    {
      id: 3,
      label: "Workspaces & Rooms",
      subtitle: "Find and book the right space for your next meeting.",
      icon: Building,
      path: "/meeting-rooms",
      active: true,
    },
    {
      id: 4,
      label: "My Profile Settings",
      subtitle: "View personal credentials and account details.",
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
        {/* Brand Header Badge */}
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

        {/* Sidebar Navigation Menu */}
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

        {/* Quick Operations Section */}
        <Typography
          variant="caption"
          sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}
        >
          QUICK REQUESTS
        </Typography>

        <Stack spacing={0.75}>
          <Box
            onClick={() => setBookingModal({ open: true, room: null })}
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
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Book a Room
            </Typography>
          </Box>

          <Box
            onClick={() => navigate("/leave")}
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
            <Calendar size={18} />
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
              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.12)" },
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
        {/* Top Header Row matching Dashboard */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#09090B" letterSpacing={-0.5}>
              Workspaces & Rooms
            </Typography>
            <Typography variant="body2" color="#71717A" mt={0.25}>
              Find and book the right space for your next meeting.
            </Typography>
          </Box>

          {/* Right Header Action Icons & User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "50px",
                px: 2,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
              }}
            >
              <Calendar size={16} color="#71717A" />
              <Typography variant="caption" fontWeight={700} color="#09090B">
                {currentDateFormatted}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setBookingModal({ open: true, room: null })}
              sx={{
                borderRadius: "50px",
                px: 2.5,
                py: 1,
                bgcolor: "#09090B",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.88rem",
                boxShadow: "0 4px 14px rgba(9, 9, 11, 0.25)",
                "&:hover": { bgcolor: "#27272A" },
              }}
            >
              Book a Room
            </Button>

            <UserProfileHeader user={user} onLogout={handleLogout} />
          </Box>
        </Box>

        {/* SUMMARY STAT CARDS GRID */}
        <Grid container spacing={2.5} mb={3.5}>
          {/* Card 1: Available Now */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E4E4E7" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  AVAILABLE NOW
                </Typography>
                <Chip size="small" label="Live" sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", color: "#2E7D32", fontWeight: 700 }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color="#09090B">
                {stats.available_now}
              </Typography>
              <Typography variant="caption" color="#71717A">
                Ready for instant booking
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: Booked Today */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E4E4E7" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  BOOKED TODAY
                </Typography>
                <Clock size={16} color="#09090B" />
              </Box>
              <Typography variant="h4" fontWeight={800} color="#09090B">
                {stats.booked_today}
              </Typography>
              <Typography variant="caption" color="#71717A">
                Scheduled meetings today
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: My Upcoming Meetings */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E4E4E7" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  MY UPCOMING
                </Typography>
                <Calendar size={16} color="#09090B" />
              </Box>
              <Typography variant="h4" fontWeight={800} color="#09090B">
                {stats.my_upcoming}
              </Typography>
              <Typography variant="caption" color="#71717A">
                Your future reservations
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4: Total Rooms */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E4E4E7" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700} color="#71717A">
                  TOTAL ROOMS
                </Typography>
                <Building size={16} color="#09090B" />
              </Box>
              <Typography variant="h4" fontWeight={800} color="#09090B">
                {stats.total_rooms}
              </Typography>
              <Typography variant="caption" color="#71717A">
                Active office conference spaces
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* CONTENT NAVIGATION TABS */}
        <Paper elevation={0} sx={{ borderRadius: "16px", p: 1, mb: 3, border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Building size={18} />} iconPosition="start" label="Room Directory" sx={{ textTransform: "none", fontWeight: 700 }} />
            <Tab icon={<Calendar size={18} />} iconPosition="start" label="Schedule Timeline" sx={{ textTransform: "none", fontWeight: 700 }} />
            <Tab icon={<Clock size={18} />} iconPosition="start" label="My Bookings" sx={{ textTransform: "none", fontWeight: 700 }} />
            {isFacilityOrAdmin && (
              <Tab icon={<Settings size={18} />} iconPosition="start" label="Room Management" sx={{ textTransform: "none", fontWeight: 700 }} />
            )}
          </Tabs>
        </Paper>

        {/* Tab 0: Room Directory Grid */}
        {activeTab === 0 && (
          <Box>
            {/* Search & Filters Toolbar */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: "16px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search room name, code or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} color="#71717A" style={{ marginRight: 8 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Min Capacity"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(e.target.value)}
                  >
                    <MenuItem value="">Any Capacity</MenuItem>
                    <MenuItem value="4">4+ People</MenuItem>
                    <MenuItem value="8">8+ People</MenuItem>
                    <MenuItem value="12">12+ People</MenuItem>
                    <MenuItem value="20">20+ People</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Locations</MenuItem>
                    <MenuItem value="North Wing">North Wing</MenuItem>
                    <MenuItem value="South Tower">South Tower</MenuItem>
                    <MenuItem value="Central Atrium">Central Atrium</MenuItem>
                    <MenuItem value="East Wing">East Wing</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Maintenance">Under Maintenance</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6} sm={3} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSearchTerm("");
                      setMinCapacity("");
                      setLocationFilter("All");
                      setStatusFilter("All");
                    }}
                    sx={{ borderRadius: "8px", py: 0.9, fontWeight: 700, borderColor: "#E4E4E7", color: "#09090B" }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Room Cards Grid */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={40} sx={{ color: "#09090B" }} />
              </Box>
            ) : rooms.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Building size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Typography variant="h6" fontWeight={700} color="#475569">
                  No meeting rooms match your filters.
                </Typography>
                <Typography variant="body2" color="#94A3B8" mt={0.5}>
                  Try resetting your search query or capacity filters.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3} alignItems="stretch">
                {rooms.map((room) => (
                  <Grid item key={room.id} xs={12} sm={6} lg={4} xl={3}>
                    <RoomCard
                      room={room}
                      onSelectRoom={(r) => setDetailsModal({ open: true, room: r })}
                      onBookRoom={(r) => setBookingModal({ open: true, room: r })}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 1: Schedule Timeline */}
        {activeTab === 1 && (
          <RoomCalendar
            rooms={rooms}
            refreshKey={refreshKey}
            onSelectBooking={(b, room) => {
              setDetailsModal({ open: true, room: room, booking: b });
            }}
            onSlotClick={(room, dateStr, hourStr) => {
              setBookingModal({
                open: true,
                room: room,
                prefillDate: dateStr,
                prefillStartTime: hourStr,
              });
            }}
          />
        )}

        {/* Tab 2: My Bookings */}
        {activeTab === 2 && <MyBookings showToast={showToast} />}

        {/* Tab 3: Room Management (Facility Manager / Admin) */}
        {activeTab === 3 && isFacilityOrAdmin && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#09090B">
                  Facility Manager Room Management
                </Typography>
                <Typography variant="body2" color="#71717A">
                  Configure meeting room capacity, facilities, and maintenance status.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setRoomMgmtModal({ open: true, room: null })}
                sx={{ borderRadius: "10px", fontWeight: 700, bgcolor: "#09090B", color: "#FFFFFF" }}
              >
                Add New Room
              </Button>
            </Box>

            <Grid container spacing={2}>
              {rooms.map((r) => (
                <Grid item key={r.id} xs={12} sm={6} md={4}>
                  <Paper p={2} sx={{ p: 2, borderRadius: "14px", border: "1px solid #E4E4E7" }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {r.room_name} ({r.room_code})
                    </Typography>
                    <Typography variant="caption" color="#71717A" display="block">
                      Floor {r.floor} • {r.location} • Cap: {r.capacity}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setRoomMgmtModal({ open: true, room: r })}
                        sx={{ borderRadius: "6px" }}
                      >
                        Edit
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* FOOTER */}
        <Box component="footer" sx={{ py: 2.5, mt: "auto", textAlign: "center", borderTop: "1px solid #E4E4E7", bgcolor: "#FFFFFF", borderRadius: "12px" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 IntraSphere – Smart Office Management System
          </Typography>
        </Box>
      </Box>

      {/* MODALS */}
      <RoomDetailsModal
        open={detailsModal.open}
        room={detailsModal.room}
        booking={detailsModal.booking}
        onClose={() => setDetailsModal({ open: false, room: null, booking: null })}
        onBookRoom={(r) => setBookingModal({ open: true, room: r })}
        onBookingCancelled={() => {
          showToast("Booking cancelled successfully", "info");
          setRefreshKey((prev) => prev + 1);
          fetchSummaryStats();
          fetchRooms();
        }}
      />

      <BookingModal
        open={bookingModal.open}
        selectedRoom={bookingModal.room}
        rooms={rooms}
        prefillDate={bookingModal.prefillDate}
        prefillStartTime={bookingModal.prefillStartTime}
        onClose={() => setBookingModal({ open: false, room: null, prefillDate: null, prefillStartTime: null })}
        onSuccess={(msg) => {
          showToast(msg, "success");
          setRefreshKey((prev) => prev + 1);
          fetchSummaryStats();
          fetchRooms();
        }}
      />

      <RoomManagementModal
        open={roomMgmtModal.open}
        roomToEdit={roomMgmtModal.room}
        onClose={() => setRoomMgmtModal({ open: false, room: null })}
        onSuccess={(msg) => {
          showToast(msg, "success");
          fetchSummaryStats();
          fetchRooms();
        }}
      />

      {/* TOAST FEEDBACK */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: "100%", borderRadius: "12px" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
