import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Groups,
  AccessTime,
  LocationOn,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function UpcomingMeetings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const fetchMyMeetings = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/v1/meeting-bookings/my");
        const list = Array.isArray(response.data) ? response.data : [];
        // Filter out cancelled and sort by start time
        const active = list
          .filter((m) => m.status !== "Cancelled")
          .slice(0, 5);
        setMeetings(active);
      } catch (err) {
        console.error("Fetch upcoming meetings error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyMeetings();
  }, []);

  const formatMeetingTime = (startStr, endStr) => {
    if (!startStr) return "--:--";
    try {
      const startDt = new Date(startStr);
      const endDt = endStr ? new Date(endStr) : null;
      const datePart = startDt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const startTime = startDt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const endTime = endDt ? endDt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      return `${datePart} • ${startTime} ${endTime ? `- ${endTime}` : ""}`;
    } catch {
      return startStr;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#E0F2FE",
              color: "#0369A1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Groups sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            Upcoming Meetings
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={() => navigate("/meeting-rooms")}
          endIcon={<ArrowForward sx={{ fontSize: "14px !important" }} />}
          sx={{
            fontWeight: 700,
            color: "#10B981",
            textTransform: "none",
            fontSize: "0.78rem",
          }}
        >
          View All
        </Button>
      </Stack>

      {/* List */}
      {loading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rectangular" height={54} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rectangular" height={54} sx={{ borderRadius: "12px" }} />
        </Stack>
      ) : meetings.length === 0 ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            textAlign: "center",
            borderRadius: "14px",
            bgcolor: "#F8FAFC",
            border: "1px dashed #CBD5E1",
          }}
        >
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            No upcoming meeting bookings scheduled.
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/meeting-rooms")}
            sx={{ mt: 1, fontWeight: 700, color: "#10B981", textTransform: "none" }}
          >
            Book a Meeting Room
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {meetings.map((m) => (
            <Paper
              key={m._id || m.id}
              elevation={0}
              onClick={() => setSelectedMeeting(m)}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  bgcolor: "#FFFFFF",
                  borderColor: "#10B981",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.1)",
                },
              }}
            >
              <Box sx={{ overflow: "hidden", pr: 1 }}>
                <Typography variant="body2" fontWeight={700} color="#0F172A" noWrap>
                  {m.title || m.room_name || "Meeting"}
                </Typography>
                <Typography
                  variant="caption"
                  color="#64748B"
                  display="flex"
                  alignItems="center"
                  gap={0.6}
                  mt={0.3}
                >
                  <AccessTime sx={{ fontSize: 13, color: "#10B981" }} />
                  {formatMeetingTime(m.start_time, m.end_time)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<LocationOn sx={{ fontSize: "12px !important" }} />}
                  label={m.room_name || "Meeting Room"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    bgcolor: "#E0F2FE",
                    color: "#0369A1",
                    borderRadius: "6px",
                  }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        PaperProps={{ sx: { borderRadius: "16px", p: 1, minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#0F172A" }}>
          Meeting Booking Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedMeeting && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={800} color="#10B981">
                {selectedMeeting.title || "Meeting Booking"}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Room:</strong> {selectedMeeting.room_name || "N/A"}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Time:</strong> {formatMeetingTime(selectedMeeting.start_time, selectedMeeting.end_time)}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Status:</strong> {selectedMeeting.status || "Confirmed"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMeeting(null)} sx={{ fontWeight: 700, color: "#475569" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
