import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import api from "../../api/axios";

export default function MeetingRoomManagement({ openAddSignal, onResetAddSignal, onRefreshStats }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add / Edit Modal state
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    capacity: 8,
    floor: 1,
    building: "Main Building",
    location: "Floor 1, East Wing",
    facilities: "TV, Video Conference, Whiteboard, High-speed Wi-Fi",
    description: "",
    status: "Available",
    is_active: true,
  });

  // Maintenance Dialog state
  const [openMaintModal, setOpenMaintModal] = useState(false);
  const [selectedRoomForMaint, setSelectedRoomForMaint] = useState(null);
  const [maintReason, setMaintReason] = useState("");
  const [maintPriority, setMaintPriority] = useState("Medium");

  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/api/v1/facility/meeting-rooms", { params });
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to load meeting rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, statusFilter]);

  useEffect(() => {
    if (openAddSignal) {
      handleOpenAddModal();
      if (onResetAddSignal) onResetAddSignal();
    }
  }, [openAddSignal]);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      name: "",
      capacity: 8,
      floor: 1,
      building: "Main Building",
      location: "Floor 1, East Wing",
      facilities: "TV, Video Conference, Whiteboard, High-speed Wi-Fi",
      description: "",
      status: "Available",
      is_active: true,
    });
    setOpenRoomModal(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name || room.room_name || "",
      room_code: room.room_code || "",
      capacity: room.capacity || 8,
      floor: room.floor || 1,
      building: room.building || "Main Building",
      location: room.location || "",
      facilities: Array.isArray(room.facilities) ? room.facilities.join(", ") : room.facilities || "",
      description: room.description || "",
      status: room.status || "Available",
      is_active: room.is_active ?? true,
    });
    setOpenRoomModal(true);
  };

  const handleSaveRoom = async () => {
    if (!roomFormData.name) {
      showFeedback("Room name is required.", "error");
      return;
    }

    try {
      const facilitiesList = typeof roomFormData.facilities === "string"
        ? roomFormData.facilities.split(",").map((s) => s.trim()).filter(Boolean)
        : roomFormData.facilities;

      const payload = {
        ...roomFormData,
        room_name: roomFormData.name,
        name: roomFormData.name,
        room_code: roomFormData.room_code || `CR-${Math.floor(100 + Math.random() * 900)}`,
        capacity: Number(roomFormData.capacity),
        floor: Number(roomFormData.floor),
        facilities: facilitiesList,
      };

      if (editingRoom) {
        await api.patch(`/api/v1/facility/meeting-rooms/${editingRoom._id || editingRoom.id}`, payload);
        showFeedback("Meeting room updated successfully!");
      } else {
        await api.post("/api/v1/facility/meeting-rooms", payload);
        showFeedback("New meeting room created successfully!");
      }

      setOpenRoomModal(false);
      fetchRooms();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to save meeting room", "error");
    }
  };

  const handleToggleActive = async (room) => {
    try {
      await api.patch(`/api/v1/facility/meeting-rooms/${room._id || room.id}/deactivate`);
      showFeedback(`Room ${room.is_active ? "deactivated" : "activated"} successfully!`);
      fetchRooms();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback("Failed to update active state", "error");
    }
  };

  const handleOpenMaintenanceModal = (room) => {
    setSelectedRoomForMaint(room);
    setMaintReason("");
    setMaintPriority("Medium");
    setOpenMaintModal(true);
  };

  const handleSaveMaintenance = async () => {
    if (!selectedRoomForMaint) return;
    try {
      const targetStatus = selectedRoomForMaint.status === "Maintenance" ? "Available" : "Maintenance";

      await api.patch(`/api/v1/facility/meeting-rooms/${selectedRoomForMaint._id || selectedRoomForMaint.id}/maintenance`, {
        status: targetStatus,
        issue_title: maintReason || "Scheduled Maintenance Check",
        issue_description: maintReason || "Facility routine maintenance update.",
        priority: maintPriority,
      });

      showFeedback(`Room status updated to ${targetStatus}!`);
      setOpenMaintModal(false);
      fetchRooms();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to update maintenance status", "error");
    }
  };

  return (
    <Box>
      {/* Header & Controls Bar */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Meeting Room Management
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage room availability, maintenance status, facilities, and seating capacities.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ bgcolor: "#F97316", color: "#FFFFFF", fontWeight: 700, borderRadius: "10px", textTransform: "none", px: 2.5 }}
          >
            Add Meeting Room
          </Button>
        </Stack>

        {/* Filter Row */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
          <TextField
            size="small"
            placeholder="Search room name, location, facilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} />,
            }}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {feedbackMsg.text && (
        <Alert severity={feedbackMsg.type || "info"} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFeedbackMsg({ type: "", text: "" })}>
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Meeting Rooms Grid */}
      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress sx={{ color: "#F97316" }} />
        </Box>
      ) : rooms.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF" }}>
          <MeetingRoomIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#475569">
            No Meeting Rooms Found
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Try adjusting your search query or add a new meeting room.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => {
            const isMaint = room.status === "Maintenance";
            const isInactive = !room.is_active || room.status === "Inactive";

            return (
              <Grid item xs={12} sm={6} md={4} key={room._id || room.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${isMaint ? "#FFE0B2" : isInactive ? "#E2E8F0" : "#E2E8F0"}`,
                    bgcolor: isMaint ? "#FFFBF5" : isInactive ? "#F8FAFC" : "#FFFFFF",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      borderColor: "#F97316",
                    },
                  }}
                >
                  {/* Top Status & Controls */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={isMaint ? <BuildIcon sx={{ fontSize: "14px !important" }} /> : <CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                        label={isInactive ? "Inactive" : room.status || "Available"}
                        size="small"
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          bgcolor: isInactive ? "#F1F5F9" : isMaint ? "#FFF3E0" : "#E8F5E9",
                          color: isInactive ? "#64748B" : isMaint ? "#E65100" : "#2E7D32",
                        }}
                      />
                      {room.room_code && (
                        <Chip
                          label={room.room_code}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                          }}
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Room">
                        <IconButton size="small" onClick={() => handleOpenEditModal(room)} sx={{ color: "#475569" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isMaint ? "Clear Maintenance" : "Mark Maintenance"}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenMaintenanceModal(room)}
                          sx={{ color: isMaint ? "#E65100" : "#94A3B8" }}
                        >
                          <BuildIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={room.is_active ? "Deactivate" : "Activate"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(room)}
                          sx={{ color: room.is_active ? "#2E7D32" : "#D32F2F" }}
                        >
                          <PowerSettingsNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* Room Details */}
                  <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
                    {room.name || room.room_name || "Meeting Room"}
                  </Typography>

                  <Stack direction="row" spacing={2} color="#64748B" mb={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PeopleIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={600}>
                        {room.capacity} Seats
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Floor {room.floor}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="#334155" sx={{ fontSize: "0.82rem", mb: 2 }}>
                    {room.location || room.building || "Main Office Building"}
                  </Typography>

                  {/* Facilities Chips */}
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.8}>
                    {(Array.isArray(room.facilities) ? room.facilities : (room.facilities || "").split(",")).slice(0, 3).map((f, i) => (
                      <Chip key={i} label={f.trim()} size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#F1F5F9", color: "#475569" }} />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openRoomModal} onClose={() => setOpenRoomModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          {editingRoom ? "Edit Meeting Room" : "Add New Meeting Room"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth size="small" label="Room Name" value={roomFormData.name} onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="number" label="Capacity (Seats)" value={roomFormData.capacity} onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" type="number" label="Floor" value={roomFormData.floor} onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Building" value={roomFormData.building} onChange={(e) => setRoomFormData({ ...roomFormData, building: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Location / Wing" value={roomFormData.location} onChange={(e) => setRoomFormData({ ...roomFormData, location: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Facilities (comma-separated)" value={roomFormData.facilities} onChange={(e) => setRoomFormData({ ...roomFormData, facilities: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} size="small" label="Description" value={roomFormData.description} onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenRoomModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoom} sx={{ bgcolor: "#F97316", fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Save Room</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={openMaintModal} onClose={() => setOpenMaintModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#E65100" }}>
          {selectedRoomForMaint?.status === "Maintenance" ? "Clear Room Maintenance" : "Mark Room For Maintenance"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" mb={2}>
            {selectedRoomForMaint?.status === "Maintenance"
              ? `Are you sure you want to restore '${selectedRoomForMaint?.name}' back to Available status?`
              : `Marking '${selectedRoomForMaint?.name}' under maintenance will prevent new bookings during the maintenance window.`}
          </Typography>

          {selectedRoomForMaint?.status !== "Maintenance" && (
            <Stack spacing={2}>
              <TextField fullWidth size="small" label="Reason / Issue Description" value={maintReason} onChange={(e) => setMaintReason(e.target.value)} />
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={maintPriority} label="Priority" onChange={(e) => setMaintPriority(e.target.value)}>
                  <MenuItem value="Low">Low Priority</MenuItem>
                  <MenuItem value="Medium">Medium Priority</MenuItem>
                  <MenuItem value="High">High Priority</MenuItem>
                  <MenuItem value="Critical">Critical Priority</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenMaintModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMaintenance} sx={{ bgcolor: "#ED6C02", fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
