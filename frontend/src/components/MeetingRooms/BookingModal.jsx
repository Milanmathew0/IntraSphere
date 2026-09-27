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
  Paper,
} from "@mui/material";
import { Calendar, Clock, Users, AlertCircle, Info } from "lucide-react";
import api from "../../api/axios";

export default function BookingModal({ open, onClose, selectedRoom, rooms = [], onSuccess, prefillDate, prefillStartTime }) {
  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState("Internal Sync");
  
  // Date & Time Defaults
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const [employees, setEmployees] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      const [h, m] = prefillStartTime.split(":").map(Number);
      const endH = String((h + 1) % 24).padStart(2, "0");
      setEndTime(`${endH}:${String(m).padStart(2, "0")}`);
    }
  }, [prefillDate, prefillStartTime]);

  useEffect(() => {
    if (open) {
      setErrorMsg("");
      api.get("/api/v1/employees")
        .then((res) => {
          const list = res.data.employees || res.data || [];
          setEmployees(list.filter((e) => e.is_active !== false));
        })
        .catch((err) => console.error("Error fetching employees:", err));
    }
  }, [open]);

  const activeRoomObj = rooms.find((r) => (r.id || r._id) === roomId) || selectedRoom;

  // Compute duration in minutes
  const getDurationMinutes = () => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    return (eH * 60 + eM) - (sH * 60 + sM);
  };

  const durationMins = getDurationMinutes();

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

    if (activeRoomObj?.status === "Maintenance") {
      setErrorMsg("This meeting room is currently under maintenance.");
      return;
    }

    // Time & Duration Validations
    if (durationMins <= 0) {
      setErrorMsg("End time must be later than start time. Meeting duration must be greater than zero.");
      return;
    }
    if (durationMins < 15) {
      setErrorMsg("Meeting duration must be at least 15 minutes.");
      return;
    }
    if (durationMins > 240) {
      setErrorMsg("Meeting duration cannot exceed 4 hours.");
      return;
    }

    const startIso = `${date}T${startTime}:00`;
    const endIso = `${date}T${endTime}:00`;
    const startDateObj = new Date(startIso);
    const endDateObj = new Date(endIso);
    const now = new Date();

    if (endDateObj <= now) {
      setErrorMsg("Cannot book a meeting room for a past time slot.");
      return;
    }

    const attendeeIds = selectedAttendees.map((a) => a._id || a.id);
    const totalCount = attendeeIds.length + 1; // Organizer included

    if (activeRoomObj && totalCount > activeRoomObj.capacity) {
      setErrorMsg(`Selected room cannot accommodate all attendees. Room capacity is ${activeRoomObj.capacity}.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        room_id: roomId,
        title: title.trim(),
        description: description.trim(),
        meeting_type: meetingType,
        start_time: startDateObj.toISOString(),
        end_time: endDateObj.toISOString(),
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
      const detail = err.response?.data?.detail;
      let msg = "Failed to create room booking.";
      if (err.response?.status === 409) {
        msg = detail || "Sorry, this room is already booked for the selected time slot. Please select another time or room.";
      } else if (typeof detail === "string") {
        msg = detail;
      }
      setErrorMsg(msg);
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
                  <MenuItem key={r.id || r._id} value={r.id || r._id} disabled={r.status === "Maintenance"}>
                    <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {r.room_name} ({r.room_code})
                      </Typography>
                      <Chip
                        label={r.status === "Maintenance" ? "Maintenance" : `Cap: ${r.capacity}`}
                        size="small"
                        color={r.status === "Maintenance" ? "warning" : "default"}
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                      />
                    </Box>
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

            {/* Duration Info Preview */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: durationMins > 0 && durationMins <= 240 ? "#F0F9FF" : "#FEF2F2", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" fontWeight={700} color={durationMins > 0 && durationMins <= 240 ? "#0284C7" : "#DC2626"}>
                  Meeting Duration: {durationMins > 0 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : "Invalid interval"}
                  {activeRoomObj && ` • Max capacity: ${activeRoomObj.capacity} participants`}
                </Typography>
              </Paper>
            </Grid>

            {/* Attendees Autocomplete */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.department || "Employee"})`}
                value={selectedAttendees}
                onChange={(e, newValue) => setSelectedAttendees(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Attendees" placeholder="Add colleagues..." />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Total Participants: {selectedAttendees.length + 1} (Organizer included)
              </Typography>
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
            disabled={loading || activeRoomObj?.status === "Maintenance"}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
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
