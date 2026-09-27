import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import { MoreVert, AccessTime, LocationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function UpcomingMeetings() {
  const navigate = useNavigate();

  const meetings = [
    {
      id: 1,
      title: "Team Stand-up",
      time: "09:00 - 10:00 AM",
      location: "",
      color: "#10B981",
    },
    {
      id: 2,
      title: "Project Discussion",
      time: "11:00 - 12:00 PM",
      location: "Conference Room A",
      color: "#2563EB",
    },
    {
      id: 3,
      title: "Client Review Meeting",
      time: "02:00 - 04:00 PM",
      location: "Meeting Room 2",
      color: "#EF4444",
    },
  ];

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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800} color="#0A1628" sx={{ fontSize: "1.05rem" }}>
          Upcoming Meetings
        </Typography>
        <Button
          size="small"
          onClick={() => navigate("/meeting-rooms")}
          sx={{
            fontWeight: 700,
            color: "#2563EB",
            textTransform: "none",
            fontSize: "0.78rem",
            p: 0,
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          View All
        </Button>
      </Box>

      {/* Meetings List matching reference */}
      <Stack spacing={1.5}>
        {meetings.map((m) => (
          <Box
            key={m.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.2,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
              {/* Colored Indicator Dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: m.color,
                  mt: 0.8,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography variant="body2" fontWeight={800} color="#0A1628" sx={{ fontSize: "0.84rem", lineHeight: 1.2 }}>
                  {m.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="#64748B"
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  sx={{ fontSize: "0.72rem", mt: 0.3 }}
                >
                  <AccessTime sx={{ fontSize: 12, color: "#94A3B8" }} /> {m.time}
                  {m.location && (
                    <>
                      • <LocationOn sx={{ fontSize: 12, color: "#94A3B8" }} /> {m.location}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>

            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
