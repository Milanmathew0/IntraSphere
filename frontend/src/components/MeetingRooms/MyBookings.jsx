import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Calendar, Clock, MapPin, Users, Ban, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";

export default function MyBookings({ showToast }) {
  const [tabValue, setTabValue] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/meeting-bookings/my");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching my bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    const startDt = new Date(b.start_time);
    const endDt = new Date(b.end_time);

    if (tabValue === "upcoming") {
      return b.status === "Confirmed" && endDt >= now;
    }
    if (tabValue === "today") {
      return b.status !== "Cancelled" && (startDt.toDateString() === now.toDateString() || endDt.toDateString() === now.toDateString());
    }
    if (tabValue === "past") {
      return b.status === "Completed" || (b.status === "Confirmed" && endDt < now);
    }
    if (tabValue === "cancelled") {
      return b.status === "Cancelled";
    }
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModal.booking) return;
    try {
      await api.patch(`/api/v1/meeting-bookings/${cancelModal.booking.id}/cancel`, {
        cancellation_reason: "Cancelled by user",
      });
      if (showToast) showToast("Meeting booking cancelled successfully.", "info");
      setCancelModal({ open: false, booking: null });
      fetchMyBookings();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.detail || "Failed to cancel booking", "error");
    }
  };

  const getStatusChip = (st) => {
    switch (st) {
      case "Confirmed":
        return <Chip size="small" label="Confirmed" sx={{ bgcolor: "#FFF7ED", color: "#C2410C", fontWeight: 700 }} />;
      case "Completed":
        return <Chip size="small" label="Completed" sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", color: "#2E7D32", fontWeight: 700 }} />;
      case "Cancelled":
        return <Chip size="small" label="Cancelled" sx={{ bgcolor: "#F1F5F9", color: "#64748B", fontWeight: 700 }} />;
      default:
        return <Chip size="small" label={st} />;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h6" fontWeight={800} color="#1E293B">
          My Room Reservations
        </Typography>
        <IconButton onClick={fetchMyBookings} size="small" sx={{ border: "1px solid #E2E8F0" }}>
          <RefreshCw size={16} color="#64748B" />
        </IconButton>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, borderBottom: "1px solid #E2E8F0" }}
      >
        <Tab value="upcoming" label="Upcoming" sx={{ textTransform: "none", fontWeight: 700 }} />
        <Tab value="today" label="Today" sx={{ textTransform: "none", fontWeight: 700 }} />
        <Tab value="past" label="Past" sx={{ textTransform: "none", fontWeight: 700 }} />
        <Tab value="cancelled" label="Cancelled" sx={{ textTransform: "none", fontWeight: 700 }} />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress size={32} sx={{ color: "#F97316" }} />
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Calendar size={36} color="#94A3B8" style={{ marginBottom: "10px" }} />
          <Typography variant="body1" fontWeight={700} color="#475569">
            You don't have any {tabValue} room bookings.
          </Typography>
          <Typography variant="caption" color="#94A3B8">
            Select a meeting room above to make a new reservation.
          </Typography>
        </Box>
      ) : (
        <Table sx={{ border: "1px solid #F1F5F9", borderRadius: "12px", overflow: "hidden" }}>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Meeting Title</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.map((b) => {
              const startDt = new Date(b.start_time);
              const endDt = new Date(b.end_time);

              return (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                      {b.room_name}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                      {b.room_code} • Floor {b.floor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                      {b.title}
                    </Typography>
                    {b.description && (
                      <Typography variant="caption" color="#64748B" noWrap display="block" sx={{ maxWidth: 200 }}>
                        {b.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#F97316">
                      {startDt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                      {startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={b.meeting_type} sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.72rem" }} />
                  </TableCell>
                  <TableCell>
                    {getStatusChip(b.status)}
                  </TableCell>
                  <TableCell>
                    {b.status === "Confirmed" && startDt >= now && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelModal({ open: true, booking: b })}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, px: 1.5, py: 0.2 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModal.open} onClose={() => setCancelModal({ open: false, booking: null })} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>Cancel Booking?</DialogTitle>
        <DialogContent>
          {cancelModal.booking && (
            <Typography variant="body2" color="#475569">
              Are you sure you want to cancel your booking for <strong>{cancelModal.booking.room_name}</strong> ("{cancelModal.booking.title}")?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelModal({ open: false, booking: null })} variant="outlined" sx={{ borderRadius: "8px" }}>
            Keep Booking
          </Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" sx={{ borderRadius: "8px", fontWeight: 700 }}>
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
