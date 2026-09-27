import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import {
  MoreVert,
  LocationOn,
  CalendarToday,
  VideoCameraFront,
  Groups,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function TodaySchedule() {
  const navigate = useNavigate();

  const scheduleItems = [
    {
      id: 1,
      time: "09:00 - 10:00 AM",
      title: "Team Stand-up",
      subtitle: "Microsoft Teams",
      subtitleType: "teams",
      iconBg: "#E0F2FE",
      iconColor: "#0284C7",
      dotColor: "#2563EB",
    },
    {
      id: 2,
      time: "11:00 - 12:00 PM",
      title: "Project Discussion",
      subtitle: "Conference Room A",
      subtitleType: "location",
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
      dotColor: "#2563EB",
    },
    {
      id: 3,
      time: "02:00 - 04:00 PM",
      title: "Client Review Meeting",
      subtitle: "Meeting Room 2",
      subtitleType: "location",
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
      dotColor: "#2563EB",
    },
  ];

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
          Today's Schedule
        </Typography>
        <Button
          size="small"
          onClick={() => navigate("/meeting-rooms")}
          sx={{
            color: "#2563EB",
            fontWeight: 700,
            fontSize: "0.78rem",
            textTransform: "none",
            p: 0,
            minWidth: 0,
          }}
        >
          View All
        </Button>
      </Box>

      {/* Timeline Container */}
      <Stack spacing={2} sx={{ position: "relative" }}>
        {/* Vertical Connecting Line */}
        <Box
          sx={{
            position: "absolute",
            left: 145,
            top: 20,
            bottom: 20,
            width: 2,
            bgcolor: "#E2E8F0",
            zIndex: 0,
          }}
        />

        {scheduleItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Time + Blue Dot */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 155 }}>
              <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ fontSize: "0.78rem" }}>
                {item.time}
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: item.dotColor,
                  flexShrink: 0,
                }}
              />
            </Box>

            {/* Content Box */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 1.2,
                px: 1.5,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                ml: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.subtitleType === "teams" ? (
                    <CalendarToday sx={{ fontSize: 16 }} />
                  ) : (
                    <Groups sx={{ fontSize: 16 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.82rem", lineHeight: 1.1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="#64748B"
                    sx={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}
                  >
                    {item.subtitleType === "teams" ? (
                      <Box component="span" sx={{ color: "#7C3AED", fontWeight: 600 }}>
                        {item.subtitle}
                      </Box>
                    ) : (
                      <>
                        <LocationOn sx={{ fontSize: 12, color: "#EC4899" }} /> {item.subtitle}
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>

              <IconButton size="small" sx={{ color: "#94A3B8" }}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
