import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today, Event } from "@mui/icons-material";

export default function EmployeeCalendar({ bookings = [], events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  // Compute days in month and starting day offset
  const firstDayOfMonth = new Date(year, month, 1);
  // Get day index starting from Monday (0: Mon, 6: Sun)
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNum = today.getDate();

  // Create array of days
  const calendarCells = [];
  for (let i = 0; i < startDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Check if date has booking or event
  const hasEventOrBooking = (dayNum) => {
    if (!dayNum) return false;
    const targetDateStr = new Date(year, month, dayNum).toDateString();
    return bookings.some((b) => {
      const bDt = new Date(b.start_time || b.date);
      return bDt.toDateString() === targetDateStr;
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Calendar Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Event sx={{ color: "#10B981", fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            {monthNames[month]} {year}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            size="small"
            onClick={handleTodayClick}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#10B981",
              minWidth: 46,
              px: 1,
              py: 0.3,
              borderRadius: "6px",
              bgcolor: "#F0F7FF",
              "&:hover": { bgcolor: "#E0F2FE" },
            }}
          >
            Today
          </Button>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "#475569" }}>
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} sx={{ color: "#475569" }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Days of Week Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          mb: 1,
        }}
      >
        {dayNames.map((day, idx) => (
          <Typography
            key={idx}
            variant="caption"
            fontWeight={700}
            color="#94A3B8"
            sx={{ fontSize: "0.72rem" }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          textAlign: "center",
        }}
      >
        {calendarCells.map((dayNum, index) => {
          if (!dayNum) {
            return <Box key={index} sx={{ height: 36 }} />;
          }

          const isTodayCell = isCurrentMonth && dayNum === todayDateNum;
          const hasEvent = hasEventOrBooking(dayNum);

          return (
            <Tooltip
              key={index}
              title={hasEvent ? `Bookings on ${monthNames[month]} ${dayNum}` : ""}
              arrow
            >
              <Box
                sx={{
                  height: 36,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  cursor: "pointer",
                  bgcolor: isTodayCell ? "#10B981" : "transparent",
                  color: isTodayCell ? "#FFFFFF" : "#0F172A",
                  fontWeight: isTodayCell ? 700 : 500,
                  fontSize: "0.82rem",
                  position: "relative",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isTodayCell ? "#059669" : "#F1F5F9",
                  },
                }}
              >
                {dayNum}

                {/* Event Dot Indicator */}
                {hasEvent && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: isTodayCell ? "#FFFFFF" : "#10B981",
                      position: "absolute",
                      bottom: 4,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
