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
  Clock,
  Building,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import AppLayout from "../components/layout/AppLayout";
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

  const userRole = user?.role || "Employee";
  const isFacilityOrAdmin = ["Admin", "Facility Manager"].includes(userRole);

  return (
    <AppLayout activeTabOverride="meeting-rooms">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px" }}>
              Meeting Rooms & Conference Spaces
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.25 }}>
              Find and book conference rooms, call pods, and war rooms.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setBookingModal({ open: true, room: null })}
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
            Book a Room
          </Button>
        </Box>

        {/* SUMMARY STAT CARDS GRID */}
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
          {/* Card 1: Available Now */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                AVAILABLE NOW
              </Typography>
              <Chip size="small" label="Live" sx={{ bgcolor: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0", fontWeight: 700 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {stats.available_now}
            </Typography>
            <Typography variant="caption" color="#64748B">
              Ready for instant booking
            </Typography>
          </Paper>

          {/* Card 2: Booked Today */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                BOOKED TODAY
              </Typography>
              <Clock size={16} color="#1976D2" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {stats.booked_today}
            </Typography>
            <Typography variant="caption" color="#64748B">
              Scheduled meetings today
            </Typography>
          </Paper>

          {/* Card 3: My Upcoming Meetings */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                MY UPCOMING
              </Typography>
              <Calendar size={16} color="#1976D2" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {stats.my_upcoming}
            </Typography>
            <Typography variant="caption" color="#64748B">
              Your future reservations
            </Typography>
          </Paper>

          {/* Card 4: Total Rooms */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                TOTAL ROOMS
              </Typography>
              <Building size={16} color="#1976D2" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {stats.total_rooms}
            </Typography>
            <Typography variant="caption" color="#64748B">
              Active office conference spaces
            </Typography>
          </Paper>
        </Box>

        {/* CONTENT NAVIGATION TABS */}
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
                  color: "#1976D2",
                },
              },
            }}
          >
            <Tab icon={<Building size={18} />} iconPosition="start" label="Room Directory" />
            <Tab icon={<Calendar size={18} />} iconPosition="start" label="Schedule Timeline" />
            <Tab icon={<Clock size={18} />} iconPosition="start" label="My Bookings" />
            {isFacilityOrAdmin && (
              <Tab icon={<Settings size={18} />} iconPosition="start" label="Room Management" />
            )}
          </Tabs>
        </Paper>

        {/* Tab 0: Room Directory Grid */}
        {activeTab === 0 && (
          <Box>
            {/* Search & Filters Toolbar */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "2fr repeat(3, 1fr) 1fr",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search room name, code or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} color="#64748B" style={{ marginRight: 8 }} />,
                  }}
                />

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
                  sx={{ borderRadius: "8px", py: 0.9, fontWeight: 700, borderColor: "#E2E8F0", color: "#475569" }}
                >
                  Reset
                </Button>
              </Box>
            </Paper>

            {/* Room Cards Grid */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={40} sx={{ color: "#1976D2" }} />
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelectRoom={(r) => setDetailsModal({ open: true, room: r })}
                    onBookRoom={(r) => setBookingModal({ open: true, room: r })}
                  />
                ))}
              </Box>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Facility Manager Room Management
                </Typography>
                <Typography variant="body2" color="#64748B">
                  Configure meeting room capacity, facilities, and maintenance status.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setRoomMgmtModal({ open: true, room: null })}
                sx={{ borderRadius: "10px", fontWeight: 700, bgcolor: "#1976D2", color: "#FFFFFF", "&:hover": { bgcolor: "#1565C0" } }}
              >
                Add New Room
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {rooms.map((r) => (
                <Paper key={r.id} elevation={0} sx={{ p: 2, borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {r.room_name} ({r.room_code})
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block">
                    Floor {r.floor} • {r.location} • Cap: {r.capacity}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1.5}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setRoomMgmtModal({ open: true, room: r })}
                      sx={{ borderRadius: "6px", textTransform: "none", fontWeight: 700 }}
                    >
                      Edit Room
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}
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
    </AppLayout>
  );
}
