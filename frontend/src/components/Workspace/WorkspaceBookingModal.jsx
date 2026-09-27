import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import api from "../../api/axios";

const PURPOSE_OPTIONS = [
  "Office work",
  "Team collaboration",
  "Focused work",
  "Project work",
  "Other",
];

export default function WorkspaceBookingModal({ open, onClose, desk, onBookingSuccess }) {
  // Date default to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [purpose, setPurpose] = useState("Office work");
  const [notes, setNotes] = useState("");

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset form when opened or desk changes
  useEffect(() => {
    if (open) {
      setDate(todayStr);
      setStartTime("09:00");
      setEndTime("13:00");
      setPurpose("Office work");
      setNotes("");
      setErrorMessage("");
      setAvailability(null);
    }
  }, [open, desk]);

  // Check live backend availability whenever Date, StartTime, or EndTime changes
  useEffect(() => {
    if (open && desk?.id && date && startTime && endTime) {
      checkLiveAvailability();
    }
  }, [open, desk, date, startTime, endTime]);

  const getCombinedISO = (dateStr, timeStr) => {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString();
  };

  const checkLiveAvailability = async () => {
    if (!startTime || !endTime || startTime >= endTime) {
      setAvailability({ available: false, reason: "Start time must be strictly before end time." });
      return;
    }

    setCheckingAvailability(true);
    try {
      const startISO = getCombinedISO(date, startTime);
      const endISO = getCombinedISO(date, endTime);

      const res = await api.get(`/api/v1/workspaces/${desk.id}/availability`, {
        params: {
          start_time: startISO,
          end_time: endISO,
        },
      });

      setAvailability(res.data);
    } catch (err) {
      console.error("Availability check failed:", err);
      setAvailability({
        available: false,
        reason: err.response?.data?.detail || "Could not verify desk availability.",
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateDurationHours = () => {
    if (!startTime || !endTime || startTime >= endTime) return 0;
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const totalMinutes = eH * 60 + eM - (sH * 60 + sM);
    return (totalMinutes / 60).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!date || !startTime || !endTime) {
      setErrorMessage("Please select valid date and time parameters.");
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage("End time must be later than start time.");
      return;
    }

    setSubmitting(true);
    try {
      const startISO = getCombinedISO(date, startTime);
      const endISO = getCombinedISO(date, endTime);

      const payload = {
        desk_id: desk.id,
        date: date,
        start_time: startISO,
        end_time: endISO,
        purpose: purpose,
        notes: notes,
      };

      const res = await api.post("/api/v1/workspace-reservations/", payload);

      if (onBookingSuccess) {
        onBookingSuccess(res.data.message || "Desk reserved successfully!");
      }
      onClose();
    } catch (err) {
      console.error("Booking creation error:", err);
      const detail = err.response?.data?.detail || "Failed to create workspace reservation.";
      setErrorMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (!desk) return null;
  const duration = calculateDurationHours();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth paperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Sparkles size={22} color="#10B981" />
          <Typography variant="h6" fontWeight={800} color="#09090B">
            Reserve Workspace
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#71717A" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Error Alert */}
            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ borderRadius: "12px" }}>
                {errorMessage}
              </Alert>
            )}

            {/* Selected Desk Banner */}
            <Box
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#065F46">
                  {desk.desk_name} ({desk.desk_code})
                </Typography>
                <Typography variant="caption" color="#047857">
                  Floor {desk.floor} • {desk.zone} • {desk.building}
                </Typography>
              </Box>
              <Chip label={desk.workspace_type || "Hot Desk"} size="small" sx={{ bgcolor: "#D1FAE5", color: "#047857", fontWeight: 700 }} />
            </Box>

            {/* Date Selection */}
            <TextField
              label="Reservation Date"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayStr }}
              required
            />

            {/* Start & End Time Selection */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1800 }} // 30 min intervals
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Time"
                  type="time"
                  fullWidth
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1800 }}
                  required
                />
              </Grid>
            </Grid>

            {/* Duration Display */}
            {duration > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1 }}>
                <Typography variant="caption" fontWeight={600} color="#52525B">
                  Duration: <strong>{duration} hours</strong>
                </Typography>
                <Typography variant="caption" color="#71717A">
                  Working hours: 09:00 – 18:00
                </Typography>
              </Box>
            )}

            {/* Live Backend Availability Indicator */}
            {checkingAvailability ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#F4F4F5", borderRadius: "10px" }}>
                <CircularProgress size={16} sx={{ color: "#10B981" }} />
                <Typography variant="caption" fontWeight={600} color="#52525B">
                  Checking availability with backend...
                </Typography>
              </Box>
            ) : availability ? (
              availability.available ? (
                <Alert severity="success" icon={<CheckCircle2 size={18} />} sx={{ borderRadius: "10px", py: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>
                    ✓ Desk is available during the selected time.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" icon={<AlertCircle size={18} />} sx={{ borderRadius: "10px", py: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>
                    ✕ Desk unavailable: {availability.reason || "Slot already reserved."}
                  </Typography>
                </Alert>
              )
            ) : null}

            {/* Reservation Purpose */}
            <TextField
              select
              label="Reservation Purpose"
              fullWidth
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              {PURPOSE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            {/* Notes / Special Requests */}
            <TextField
              label="Notes / Special Instructions (Optional)"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Will require quiet zone for video calls"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || (availability && !availability.available)}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
            sx={{
              bgcolor: "#10B981",
              color: "#FFFFFF",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            {submitting ? "Confirming..." : "Confirm Reservation"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
