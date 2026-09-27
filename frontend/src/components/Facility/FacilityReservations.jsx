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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import api from "../../api/axios";

export default function FacilityReservations({ onRefreshStats }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Cancellation Modal state
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedResForCancel, setSelectedResForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (resourceTypeFilter !== "All") params.resource_type = resourceTypeFilter;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/api/v1/facility/reservations", { params });
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to load facility reservations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [search, resourceTypeFilter, statusFilter]);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
  };

  const handleOpenCancelModal = (resItem) => {
    setSelectedResForCancel(resItem);
    setCancelReason("");
    setOpenCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedResForCancel) return;
    try {
      await api.patch(
        `/api/v1/facility/reservations/${selectedResForCancel.id}/cancel`,
        { cancellation_reason: cancelReason.trim() || "Cancelled by Facility Policy" },
        {
          params: {
            resource_type: selectedResForCancel.resource_type,
          },
        }
      );

      showFeedback("Reservation cancelled successfully and user notified!");
      setOpenCancelModal(false);
      fetchReservations();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to cancel reservation", "error");
    }
  };

  return (
    <Box>
      {/* Header Bar */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Facility Reservation Master Directory
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View all meeting room bookings and workspace desk reservations across organization floors.
            </Typography>
          </Box>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
          <TextField
            size="small"
            placeholder="Search employee, email, resource or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} />,
            }}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Resource Type</InputLabel>
            <Select value={resourceTypeFilter} label="Resource Type" onChange={(e) => setResourceTypeFilter(e.target.value)}>
              <MenuItem value="All">All Resources</MenuItem>
              <MenuItem value="meeting_room">Meeting Rooms</MenuItem>
              <MenuItem value="workspace">Workspace Desks</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {feedbackMsg.text && (
        <Alert severity={feedbackMsg.type || "info"} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFeedbackMsg({ type: "", text: "" })}>
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Reservations Master Table */}
      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress sx={{ color: "#7B1FA2" }} />
        </Box>
      ) : reservations.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF" }}>
          <EventNoteIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#475569">
            No Reservations Found
          </Typography>
          <Typography variant="caption" color="text.secondary">
            No meeting room bookings or desk reservations match your filters.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee / Organizer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Resource</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Location & Floor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Date & Schedule</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => {
                const now = new Date();
                const isCancelled = r.status === "Cancelled";
                const isPast = (r.end_time && new Date(r.end_time) < now) || (r.start_time && new Date(r.start_time) < now);
                const isCompleted = r.status === "Completed" || (isPast && !isCancelled);

                let statusLabel = r.status;
                let statusBg = "#E8F5E9";
                let statusColor = "#2E7D32";

                if (isCancelled) {
                  statusLabel = "Cancelled";
                  statusBg = "#FFEBEE";
                  statusColor = "#C62828";
                } else if (isCompleted) {
                  statusLabel = "Completed";
                  statusBg = "#F1F5F9";
                  statusColor = "#475569";
                }

                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {r.employee_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {r.employee_email} • {r.department}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, color: "#10B981" }}>
                      {r.resource_name}
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={r.resource_type === "meeting_room" ? <MeetingRoomIcon sx={{ fontSize: "14px !important" }} /> : <DesktopWindowsIcon sx={{ fontSize: "14px !important" }} />}
                        label={r.resource_type === "meeting_room" ? "Room" : "Desk"}
                        size="small"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: r.resource_type === "meeting_room" ? "#ECFDF5" : "#ECFDF5", color: r.resource_type === "meeting_room" ? "#059669" : "#047857" }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#334155", fontSize: "0.82rem" }}>
                      Floor {r.floor} • {r.building}
                    </TableCell>

                    <TableCell sx={{ color: "#334155", fontSize: "0.82rem" }}>
                      {r.start_time ? new Date(r.start_time).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusLabel}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: statusBg,
                          color: statusColor,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {!isCancelled && !isCompleted ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<CancelIcon fontSize="small" />}
                          onClick={() => handleOpenCancelModal(r)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: "8px", whiteSpace: "nowrap", px: 1.5 }}
                        >
                          Cancel Booking
                        </Button>
                      ) : isCancelled ? (
                        <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                          Cancelled
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                          Completed
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cancellation Dialog */}
      <Dialog open={openCancelModal} onClose={() => setOpenCancelModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#D32F2F" }}>
          Cancel Facility Reservation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" mb={2}>
            Are you sure you want to cancel the reservation for <strong>{selectedResForCancel?.resource_name}</strong> booked by <strong>{selectedResForCancel?.employee_name}</strong>?
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Cancellation Reason (Sent to Employee)"
            placeholder="e.g. Facility policy adjustment or scheduled maintenance"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCancelModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Keep Booking</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel} sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Confirm Cancellation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
