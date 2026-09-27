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
import { ChevronLeft, ChevronRight, Plus, Wrench, Clock, Calendar } from "lucide-react";
import api from "../../api/axios";

export default function RoomCalendar({ rooms = [], onSlotClick, onSelectBooking, refreshKey }) {
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Business Hours: 09:00 to 18:00 (540 minutes total)
  const OFFICE_START_HOUR = 9;
  const OFFICE_END_HOUR = 18;
  const TOTAL_OFFICE_MINUTES = (OFFICE_END_HOUR - OFFICE_START_HOUR) * 60; // 540 mins

  const hoursList = [];
  for (let h = OFFICE_START_HOUR; h <= OFFICE_END_HOUR; h++) {
    hoursList.push(h);
  }

  // Live timer for current time indicator line
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

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
  }, [selectedDate, refreshKey]);

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

  const todayStr = getTodayStr();
  const isToday = selectedDate === todayStr;
  const isPastDate = selectedDate < todayStr;

  // Calculate live current time position in percentage
  const getCurrentTimePct = () => {
    if (!isToday) return null;
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const currentMins = nowH * 60 + nowM;
    const startMins = OFFICE_START_HOUR * 60;
    const endMins = OFFICE_END_HOUR * 60;

    if (currentMins < startMins || currentMins > endMins) return null;
    return ((currentMins - startMins) / TOTAL_OFFICE_MINUTES) * 100;
  };

  const currentTimePct = getCurrentTimePct();
  const currentTimeLabel = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get active confirmed bookings for a specific room on selectedDate
  const getRoomBookingsForDate = (roomId) => {
    return allBookings.filter((b) => {
      if (b.status === "Cancelled") return false;
      const rId = b.room_id || b.room || b.id;
      if (rId && String(rId) !== String(roomId)) return false;

      // Filter by selectedDate
      const bStart = new Date(b.start_time);
      const bDateStr = `${bStart.getFullYear()}-${String(bStart.getMonth() + 1).padStart(2, "0")}-${String(bStart.getDate()).padStart(2, "0")}`;
      return bDateStr === selectedDate;
    });
  };

  // Convert booking start/end into left & width percentages
  const calculateBookingStyle = (b) => {
    const bStart = new Date(b.start_time);
    const bEnd = new Date(b.end_time);

    const startMins = bStart.getHours() * 60 + bStart.getMinutes();
    const endMins = bEnd.getHours() * 60 + bEnd.getMinutes();

    const officeStartMins = OFFICE_START_HOUR * 60;
    const officeEndMins = OFFICE_END_HOUR * 60;

    const clampedStart = Math.max(officeStartMins, Math.min(officeEndMins, startMins));
    const clampedEnd = Math.max(officeStartMins, Math.min(officeEndMins, endMins));

    const left = ((clampedStart - officeStartMins) / TOTAL_OFFICE_MINUTES) * 100;
    const width = Math.max(2, ((clampedEnd - clampedStart) / TOTAL_OFFICE_MINUTES) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  // Helper to check if an hourly slot on today is in the past
  const isSlotInPast = (hour) => {
    if (isPastDate) return true;
    if (!isToday) return false;
    const nowH = currentTime.getHours();
    return hour < nowH;
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
            <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ minWidth: 180, textAlign: "center" }}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </Typography>
            <IconButton onClick={handleNextDay} size="small" sx={{ border: "1px solid #E2E8F0" }}>
              <ChevronRight size={18} />
            </IconButton>
          </Box>
          <Button
            size="small"
            variant={isToday ? "contained" : "outlined"}
            onClick={() => setSelectedDate(getTodayStr())}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Today
          </Button>
        </Stack>

        {/* Legend */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip size="small" label="Available" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569", fontWeight: 700 }} />
          <Chip size="small" label="Booked" sx={{ bgcolor: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0", fontWeight: 700 }} />
          <Chip size="small" label="Maintenance" sx={{ bgcolor: "#FEF3C7", color: "#D97706", border: "1px solid #FCD34D", fontWeight: 700 }} />
        </Stack>
      </Box>

      {/* Grid Timeline Layout */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 900, position: "relative" }}>
          {/* Header Hour Markers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `240px repeat(${hoursList.length - 1}, 1fr)`,
              gap: 0,
              alignItems: "center",
              pb: 1.5,
              mb: 1,
              borderBottom: "2px solid #E2E8F0",
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ pl: 1 }}>
              ROOM
            </Typography>
            {hoursList.slice(0, -1).map((h) => (
              <Typography key={h} variant="caption" fontWeight={700} color="#64748B" textAlign="left" sx={{ pl: 0.5 }}>
                {String(h).padStart(2, "0")}:00
              </Typography>
            ))}
          </Box>

          {/* Timeline Container with Red Current Time Vertical Line */}
          <Box sx={{ position: "relative" }}>
            {currentTimePct !== null && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `calc(240px + (100% - 240px) * ${currentTimePct / 100})`,
                  width: "2px",
                  bgcolor: "#EF4444",
                  zIndex: 20,
                  pointerEvents: "none",
                  "&::before": {
                    content: `"${currentTimeLabel}"`,
                    position: "absolute",
                    top: -24,
                    left: -20,
                    bgcolor: "#EF4444",
                    color: "#FFFFFF",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  },
                }}
              />
            )}

            {/* Room Rows */}
            {rooms.map((room) => {
              const roomId = room.id || room._id;
              const roomBookings = getRoomBookingsForDate(roomId);
              const isMaintenance = room.status === "Maintenance";

              return (
                <Box
                  key={roomId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `240px 1fr`,
                    gap: 0,
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px solid #F1F5F9",
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: "#FAFAFA" },
                  }}
                >
                  {/* Left Room Info */}
                  <Box sx={{ pr: 2, pl: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={800} color="#1E293B" noWrap>
                        {room.room_name}
                      </Typography>
                      {isMaintenance && (
                        <Chip label="Maintenance" size="small" color="warning" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800 }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="#64748B" display="block">
                      Cap: {room.capacity} • Floor {room.floor} • {room.location}
                    </Typography>
                  </Box>

                  {/* Right Track & Booking Blocks */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 52,
                      bgcolor: isMaintenance ? "#FFFBEB" : "#F8FAFC",
                      borderRadius: "10px",
                      border: isMaintenance ? "1px dashed #FCD34D" : "1px solid #E2E8F0",
                      overflow: "hidden",
                    }}
                  >
                    {/* Hourly Grid Background Lines & "+" Buttons */}
                    {isMaintenance ? (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography variant="caption" fontWeight={700} color="#D97706" display="flex" alignItems="center" gap={0.5}>
                          <Wrench size={14} /> Room Under Maintenance
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${hoursList.length - 1}, 1fr)`,
                          height: "100%",
                        }}
                      >
                        {hoursList.slice(0, -1).map((h) => {
                          const inPast = isSlotInPast(h);
                          const hourStr = `${String(h).padStart(2, "0")}:00`;

                          return (
                            <Box
                              key={h}
                              sx={{
                                borderRight: "1px dashed #E2E8F0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: inPast ? "#F1F5F9" : "transparent",
                                opacity: inPast ? 0.6 : 1,
                              }}
                            >
                              {!inPast && !isPastDate && (
                                <Tooltip title={`Book ${room.room_name} at ${hourStr}`}>
                                  <IconButton
                                    aria-label={`Book ${room.room_name} at ${hourStr}`}
                                    size="small"
                                    onClick={() => onSlotClick && onSlotClick(room, selectedDate, hourStr)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      bgcolor: "#FFFFFF",
                                      border: "1px border #CBD5E1",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                      "&:hover": { bgcolor: "#10B981", color: "#FFFFFF" },
                                    }}
                                  >
                                    <Plus size={14} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {/* Continuous Proportional Booking Blocks */}
                    {!isMaintenance &&
                      roomBookings.map((b) => {
                        const style = calculateBookingStyle(b);
                        const bStart = new Date(b.start_time);
                        const bEnd = new Date(b.end_time);
                        const timeRangeStr = `${bStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${bEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        return (
                          <Tooltip
                            key={b.id || b._id}
                            title={`${b.title} (${timeRangeStr}) — Host: ${b.organizer_name}`}
                          >
                            <Box
                              onClick={() => onSelectBooking && onSelectBooking(b, room)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                bottom: 4,
                                left: style.left,
                                width: style.width,
                                bgcolor: "#10B981",
                                color: "#FFFFFF",
                                borderRadius: "8px",
                                px: 1.2,
                                py: 0.5,
                                zIndex: 10,
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                overflow: "hidden",
                                transition: "transform 0.15s ease, background-color 0.15s ease",
                                "&:hover": {
                                  bgcolor: "#059669",
                                  transform: "scaleY(1.04)",
                                },
                              }}
                            >
                              <Typography variant="caption" fontWeight={800} display="block" noWrap fontSize="0.72rem" sx={{ lineHeight: 1.1 }}>
                                {b.title}
                              </Typography>
                              <Typography variant="caption" opacity={0.9} noWrap fontSize="0.63rem">
                                {timeRangeStr} • {b.organizer_name}
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
