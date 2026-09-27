import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function EmployeeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 27)); // September 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compute days in month and starting day offset (Sun = 0)
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Add trailing days from previous month
  for (let i = startDayIndex - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  // Add current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true });
  }

  // Add leading days for next month to complete 5 or 6 rows
  const remainingCells = 35 - calendarCells.length;
  for (let d = 1; d <= (remainingCells > 0 ? remainingCells : remainingCells + 7); d++) {
    calendarCells.push({ day: d, isCurrentMonth: false });
  }

  const todayDateNum = 27; // Highlight 27 as in image

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(10, 22, 40, 0.03)",
      }}
    >
      {/* Calendar Header matching reference */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "#475569" }}>
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={800} color="#0A1628" sx={{ fontSize: "1rem" }}>
          {monthNames[month]} {year}
        </Typography>
        <IconButton size="small" onClick={handleNextMonth} sx={{ color: "#475569" }}>
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      {/* Weekday Header */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", mb: 1.2 }}>
        {dayNames.map((d, idx) => (
          <Typography
            key={idx}
            variant="caption"
            fontWeight={600}
            color="#94A3B8"
            sx={{ fontSize: "0.72rem" }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar Days Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.8, textAlign: "center" }}>
        {calendarCells.map((cell, idx) => {
          const isToday = cell.isCurrentMonth && cell.day === todayDateNum;
          return (
            <Box
              key={idx}
              sx={{
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                bgcolor: isToday ? "#1D4ED8" : "transparent",
                color: isToday ? "#FFFFFF" : cell.isCurrentMonth ? "#0A1628" : "#CBD5E1",
                fontWeight: isToday ? 800 : cell.isCurrentMonth ? 600 : 400,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: isToday ? "0 4px 10px rgba(29, 78, 216, 0.35)" : "none",
                "&:hover": {
                  bgcolor: isToday ? "#1D4ED8" : "#F1F5F9",
                },
              }}
            >
              {cell.day}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
