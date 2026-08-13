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
  TextField,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { Calendar, Clock, Users, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../../api/axios";

export default function BookingModal({ open, onClose, selectedRoom, rooms = [], onSuccess, prefillDate, prefillStartTime }) {
  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState("Internal Sync");
  
  // Date & Time Defaults
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const [employees, setEmployees] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [availCheck, setAvailCheck] = useState(null);

  useEffect(() => {
    if (selectedRoom) {
      setRoomId(selectedRoom.id || selectedRoom._id);
    } else if (rooms.length > 0) {
      setRoomId(rooms[0].id || rooms[0]._id);
    }
  }, [selectedRoom, rooms]);

  useEffect(() => {
    if (prefillDate) setDate(prefillDate);
    if (prefillStartTime) {
      setStartTime(prefillStartTime);
      // Auto set 1 hour later
      const [h, m] = prefillStartTime.split(":").map(Number);
      const endH = String((h + 1) % 24).padStart(2, "0");
      setEndTime(`${endH}:${String(m).padStart(2, "0")}`);
    }
  }, [prefillDate, prefillStartTime]);

  // Fetch employees for attendee selection
  useEffect(() => {
    if (open) {
      api.get("/api/v1/employees")
        .then((res) => {
          const list = res.data.employees || res.data || [];
          setEmployees(list.filter((e) => e.is_active !== false));
        })
        .catch((err) => console.error("Error fetching employees:", err));
    }
  }, [open]);

  const activeRoomObj = rooms.find((r) => (r.id || r._id) === roomId) || selectedRoom;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!roomId) {
      setErrorMsg("Please select a meeting room.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a meeting title.");
      return;
    }

    // Construct Datetime strings (UTC)
    const startIso = `${date}T${startTime}:00`;
    const endIso = `${date}T${endTime}:00`;

    if (new Date(startIso) >= new Date(endIso)) {
      setErrorMsg("Start time must be strictly before end time.");
      return;
    }

    const attendeeIds = selectedAttendees.map((a) => a._id || a.id);
    const totalCount = attendeeIds.length + 1; // Organizer included

    if (activeRoomObj && totalCount > activeRoomObj.capacity) {
      setErrorMsg(`Selected room capacity (${activeRoomObj.capacity}) cannot accommodate all ${totalCount} attendees.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        room_id: roomId,
        title: title.trim(),
        description: description.trim(),
        meeting_type: meetingType,
        start_time: new Date(startIso).toISOString(),
        end_time: new Date(endIso).toISOString(),
        attendees: attendeeIds,
      };

      const res = await api.post("/api/v1/meeting-bookings/", payload);
      setLoading(false);
      if (onSuccess) {
        onSuccess(res.data.message || "Meeting room booked successfully!");
      }
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.detail || "Failed to create room booking. Please check availability.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" fontWeight={800} color="#1E293B">
          Book Meeting Room
        </Typography>
        <Typography variant="body2" color="#64748B" mt={0.5}>
          Select date, interval, and add attendees for your reservation.
        </Typography>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Room Selector */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Meeting Room"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              >
                {rooms.map((r) => (
                  <MenuItem key={r.id || r._id} value={r.id || r._id}>
                    {r.room_name} ({r.room_code}) — Cap: {r.capacity} — Floor {r.floor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Meeting Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Title"
                placeholder="e.g., Sprint Review & Architecture Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>

            {/* Meeting Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Meeting Type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
              >
                {["Internal Sync", "Client Meeting", "All Hands", "Brainstorming", "Interview", "Other"].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Date Picker */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Start Time & End Time */}
            <Grid item xs={6}>
              <TextField
                type="time"
                fullWidth
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="time"
                fullWidth
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Description / Agenda */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description / Agenda (Optional)"
                placeholder="Briefly state key discussion points or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, px: 3, justifyContent: "space-between" }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "10px", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Confirm Booking"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
