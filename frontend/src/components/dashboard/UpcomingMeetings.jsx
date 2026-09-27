import React from "react";
import { Box, Paper, Typography, Stack, Button, IconButton } from "@mui/material";
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
      borderBg: "#2563EB", // Blue vertical bar
    },
    {
      id: 2,
      title: "Project Discussion",
      time: "11:00 - 12:00 PM",
      location: "Conference Room A",
      borderBg: "#16A34A", // Green vertical bar
    },
    {
      id: 3,
      title: "Client Review Meeting",
      time: "02:00 - 04:00 PM",
      location: "Meeting Room 2",
      borderBg: "#EF4444", // Red vertical bar
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
          Upcoming Meetings
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

      {/* List */}
      <Stack spacing={1.5}>
        {meetings.map((m) => (
          <Paper
            key={m.id}
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderLeft: `4px solid ${m.borderBg}`, // Left color indicator bar
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.83rem", lineHeight: 1.1 }}>
                {m.title}
              </Typography>
              <Typography
                variant="caption"
                color="#64748B"
                sx={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 0.5, mt: 0.4 }}
              >
                <AccessTime sx={{ fontSize: 12 }} /> {m.time}
                {m.location && (
                  <>
                    <Box component="span" sx={{ mx: 0.3 }}>•</Box>
                    <LocationOn sx={{ fontSize: 12, color: "#94A3B8" }} /> {m.location}
                  </>
                )}
              </Typography>
            </Box>

            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
