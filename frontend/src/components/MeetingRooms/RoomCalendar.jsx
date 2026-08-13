import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import api from "../../api/axios";

export default function RoomCalendar({ rooms = [], onSlotClick }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const hours = [10, 11, 12, 13, 14, 15, 16, 17];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/meeting-bookings/all");
      setAllBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings for calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  // Find booking overlapping room + hour slot
  const getBookingForSlot = (roomId, hour) => {
    const slotStart = new Date(`${selectedDate}T${String(hour).padStart(2, "0")}:00:00`);
    const slotEnd = new Date(`${selectedDate}T${String(hour + 1).padStart(2, "0")}:00:00`);

    return allBookings.find((b) => {
      if (b.status === "Cancelled") return false;
      const rId = b.room_id || b.room || b.id;
      if (rId && String(rId) !== String(roomId)) return false;

      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);

      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
      {/* Calendar Header Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handlePrevDay} size="small" sx={{ border: "1px solid #E2E8F0" }}>
              <ChevronLeft size={18} />
            </IconButton>
            <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ minWidth: 170, textAlign: "center" }}>
              {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </Typography>
            <IconButton onClick={handleNextDay} size="small" sx={{ border: "1px solid #E2E8F0" }}>
              <ChevronRight size={18} />
            </IconButton>
          </Box>
          <Button
            size="small"
            onClick={() => {
              const d = new Date();
              setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
            }}
            sx={{ fontWeight: 700 }}
          >
            Today
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box display="flex" gap={1.5} alignItems="center">
            <Chip size="small" label="Available" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", fontWeight: 700 }} />
            <Chip size="small" label="Booked" sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }} />
          </Box>
        </Stack>
      </Box>

      {/* Grid Timeline Layout */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 840 }}>
          {/* Header Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `220px repeat(${hours.length}, 1fr)`,
              gap: 1.25,
              alignItems: "center",
              pb: 1.5,
              mb: 1,
              borderBottom: "2px solid #E2E8F0",
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ pl: 0.5 }}>
              ROOM
            </Typography>
            {hours.map((h) => (
              <Typography key={h} variant="caption" fontWeight={700} color="#64748B" textAlign="center">
                {String(h).padStart(2, "0")}:00
              </Typography>
            ))}
          </Box>

          {/* Room Rows */}
          {rooms.map((room) => {
            const roomId = room.id || room._id;
            return (
              <Box
                key={roomId}
                sx={{
                  display: "grid",
                  gridTemplateColumns: `220px repeat(${hours.length}, 1fr)`,
                  gap: 1.25,
                  alignItems: "center",
                  py: 1.5,
                  px: 0.5,
                  borderRadius: "10px",
                  borderBottom: "1px solid #F1F5F9",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                <Box sx={{ pr: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#1E293B" noWrap>
                    {room.room_name}
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block">
                    Cap: {room.capacity} • Fl {room.floor}
                  </Typography>
                </Box>

                {hours.map((h) => {
                  const booking = getBookingForSlot(roomId, h);
                  const hourStr = `${String(h).padStart(2, "0")}:00`;

                  if (booking) {
                    return (
                      <Tooltip key={h} title={`${booking.title} (${booking.organizer_name})`}>
                        <Box
                          sx={{
                            height: 44,
                            bgcolor: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            borderRadius: "8px",
                            p: 0.75,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "transform 0.1s ease",
                            "&:hover": { transform: "scale(1.02)" },
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} color="#1D4ED8" display="block" noWrap fontSize="0.68rem">
                            {booking.title}
                          </Typography>
                          <Typography variant="caption" color="#3B82F6" noWrap fontSize="0.62rem">
                            {booking.organizer_name}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  }

                  return (
                    <Box
                      key={h}
                      onClick={() => onSlotClick && onSlotClick(room, selectedDate, hourStr)}
                      sx={{
                        height: 44,
                        bgcolor: "#FFFFFF",
                        border: "1px dashed #CBD5E1",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(25, 118, 210, 0.08)",
                          borderColor: "#1976D2",
                          transform: "scale(1.04)",
                        },
                      }}
                    >
                      <Plus size={14} color="#94A3B8" />
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
