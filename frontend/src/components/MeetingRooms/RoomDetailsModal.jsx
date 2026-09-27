import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import {
  X,
  MapPin,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Monitor,
  Video,
  Tv,
  Wind,
  Wifi,
  Zap,
  Trash2,
} from "lucide-react";
import api from "../../api/axios";

export default function RoomDetailsModal({ room, booking, open, onClose, onBookRoom, onBookingCancelled }) {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDetails = async () => {
    if (!room || !room.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/meeting-rooms/${room.id}`);
      setRoomData(res.data);
    } catch (err) {
      console.error("Error fetching room details:", err);
      setRoomData(room);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setErrorMsg("");
      setSuccessMsg("");
      if (room) fetchDetails();
    }
  }, [open, room]);

  const handleCancelBooking = async (bId) => {
    if (!bId) return;
    setCancelling(true);
    setErrorMsg("");

    try {
      await api.patch(`/api/v1/meeting-bookings/${bId}/cancel`, {
        cancellation_reason: "Cancelled via Meeting Room Timeline",
      });
      setSuccessMsg("Booking cancelled successfully.");
      if (onBookingCancelled) onBookingCancelled();
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to cancel booking. You may not be authorized.");
    } finally {
      setCancelling(false);
    }
  };

  if (!room && !booking) return null;

  const getFacilityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("video")) return <Video size={14} />;
    if (lower.includes("display") || lower.includes("tv")) return <Tv size={14} />;
    if (lower.includes("projector")) return <Monitor size={14} />;
    if (lower.includes("air") || lower.includes("ac")) return <Wind size={14} />;
    if (lower.includes("wifi")) return <Wifi size={14} />;
    if (lower.includes("power")) return <Zap size={14} />;
    return <CheckCircle2 size={14} />;
  };

  const activeRoom = roomData || room || {};
  const activeBooking = booking;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          {activeBooking ? (
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="h5" fontWeight={800} color="#1E293B">
                {activeBooking.title}
              </Typography>
              <Chip label={activeBooking.status || "Confirmed"} color={activeBooking.status === "Cancelled" ? "error" : "primary"} size="small" sx={{ fontWeight: 800 }} />
            </Box>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={800} color="#1E293B">
                {activeRoom.room_name}
              </Typography>
              <Chip
                label={activeRoom.room_code}
                size="small"
                sx={{ bgcolor: "#1E293B", color: "#FFFFFF", fontWeight: 800, fontSize: "0.72rem" }}
              />
            </Stack>
          )}
          <Typography variant="body2" color="#64748B" mt={0.5}>
            {activeRoom.room_name} • Floor {activeRoom.floor} • {activeRoom.location}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#64748B" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }}>
            {successMsg}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress size={32} sx={{ color: "#F97316" }} />
          </Box>
        ) : activeBooking ? (
          /* Specific Booking Details View */
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box mb={2.5}>
                <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={1}>
                  MEETING DETAILS
                </Typography>
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Calendar size={18} color="#F97316" />
                    <Typography variant="body2" fontWeight={700} color="#1E293B">
                      {new Date(activeBooking.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Clock size={18} color="#F97316" />
                    <Typography variant="body2" fontWeight={700} color="#1E293B">
                      {new Date(activeBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(activeBooking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Users size={18} color="#F97316" />
                    <Typography variant="body2" color="#475569">
                      Host: <strong>{activeBooking.organizer_name}</strong>
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {activeBooking.description && (
                <Box mb={2.5}>
                  <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={0.5}>
                    AGENDA / DESCRIPTION
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
                    {activeBooking.description}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={1.5}>
                  ATTENDEES ({activeBooking.attendee_count || 1})
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 180, overflowY: "auto" }}>
                  <Typography variant="caption" fontWeight={700} color="#F97316">
                    • {activeBooking.organizer_name} (Organizer)
                  </Typography>
                  {(activeBooking.attendees || []).map((att, idx) => (
                    <Typography key={idx} variant="caption" color="#475569" display="block">
                      • {att.name || att.email || "Attendee"}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          /* Room Specs & Today's Schedule View */
          <Grid container spacing={3}>
            {/* Left Specifications */}
            <Grid item xs={12} md={6}>
              <Box mb={2.5}>
                <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={1}>
                  ROOM SPECIFICATIONS
                </Typography>
                <Stack spacing={1.2}>
                  <Box display="flex" alignItems="center" gap={1.2}>
                    <Users size={18} color="#F97316" />
                    <Typography variant="body2" fontWeight={700} color="#1E293B">
                      Capacity: {activeRoom.capacity} People
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.2}>
                    <MapPin size={18} color="#F97316" />
                    <Typography variant="body2" color="#475569">
                      Floor {activeRoom.floor}, {activeRoom.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.2}>
                    <CheckCircle2 size={18} color="#2E7D32" />
                    <Typography variant="body2" color="#475569">
                      Status: <strong>{activeRoom.current_status || activeRoom.status}</strong>
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {activeRoom.description && (
                <Box mb={2.5}>
                  <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={0.5}>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
                    {activeRoom.description}
                  </Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={1}>
                  FACILITIES & AMENITIES
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.8}>
                  {(activeRoom.facilities || []).map((fac, idx) => (
                    <Chip
                      key={idx}
                      icon={getFacilityIcon(fac)}
                      label={fac}
                      sx={{ bgcolor: "#FFF7ED", color: "#C2410C", fontWeight: 700, borderRadius: "8px" }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right Today's Schedule Timeline */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={1.5} display="flex" alignItems="center" gap={1}>
                  <Calendar size={16} color="#F97316" /> Today's Schedule
                </Typography>

                {(!activeRoom.today_schedule || activeRoom.today_schedule.length === 0) ? (
                  <Box textAlign="center" py={4}>
                    <Clock size={32} color="#94A3B8" style={{ marginBottom: "8px" }} />
                    <Typography variant="body2" color="#64748B" fontWeight={600}>
                      No meetings booked for today.
                    </Typography>
                    <Typography variant="caption" color="#94A3B8">
                      This space is free for booking!
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.2} sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
                    {activeRoom.today_schedule.map((slot, idx) => (
                      <Box
                        key={idx}
                        p={1.5}
                        sx={{ borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
                      >
                        <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                          {slot.title}
                        </Typography>
                        <Typography variant="caption" color="#F97316" fontWeight={700} display="block" my={0.3}>
                          {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Host: {slot.organizer_name} • {slot.attendee_count} Attendees
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, px: 3, justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "10px", fontWeight: 700 }}>
          Close
        </Button>

        {activeBooking && activeBooking.status !== "Cancelled" ? (
          <Button
            variant="contained"
            color="error"
            disabled={cancelling}
            onClick={() => handleCancelBooking(activeBooking.id || activeBooking._id)}
            startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
            sx={{ borderRadius: "10px", fontWeight: 700, px: 3 }}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        ) : onBookRoom ? (
          <Button
            variant="contained"
            disabled={activeRoom.status === "Maintenance" || !activeRoom.is_active}
            onClick={() => {
              onClose();
              onBookRoom(activeRoom);
            }}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
              px: 3,
            }}
          >
            Book This Room
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
