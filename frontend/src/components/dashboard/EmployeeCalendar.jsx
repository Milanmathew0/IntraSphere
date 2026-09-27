import React, { useState } from "react";
import { Box, Paper, Typography, IconButton, Stack } from "@mui/material";
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

  // Build grid for September 2026
  // Sun 30, Mon 31 from previous month if needed, or 29 29 fading
  const prevMonthFaded = [29, 29];
  const daysInSeptember = 30;
  const activeDate = 27; // Highlighted 27th

  const nextMonthFaded = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "18px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "#64748B" }}>
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
          {monthNames[month]} {year}
        </Typography>
        <IconButton size="small" onClick={handleNextMonth} sx={{ color: "#64748B" }}>
          <ChevronRight fontSize="small" />
        </IconButton>
      </Stack>

      {/* Days Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          mb: 1,
        }}
      >
        {dayNames.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            fontWeight={600}
            color="#94A3B8"
            sx={{ fontSize: "0.72rem" }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Dates Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          textAlign: "center",
        }}
      >
        {/* Prev month faded */}
        {prevMonthFaded.map((d, i) => (
          <Box key={`prev-${i}`} sx={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" color="#CBD5E1" sx={{ fontSize: "0.8rem" }}>
              {d}
            </Typography>
          </Box>
        ))}

        {/* Current Month Days */}
        {Array.from({ length: daysInSeptember }, (_, i) => i + 1).map((d) => {
          const isSelected = d === activeDate;
          return (
            <Box
              key={`day-${d}`}
              sx={{
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                cursor: "pointer",
                bgcolor: isSelected ? "#2563EB" : "transparent",
                color: isSelected ? "#FFFFFF" : "#0F172A",
                fontWeight: isSelected ? 700 : 500,
                fontSize: "0.82rem",
                "&:hover": {
                  bgcolor: isSelected ? "#2563EB" : "#F1F5F9",
                },
              }}
            >
              {d}
            </Box>
          );
        })}

        {/* Next month faded */}
        {nextMonthFaded.map((d, i) => (
          <Box key={`next-${i}`} sx={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" color="#CBD5E1" sx={{ fontSize: "0.8rem" }}>
              {d}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
