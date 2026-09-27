import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import {
  Groups,
  Videocam,
  MeetingRoom,
  MoreVert,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function TodaySchedule({ scheduleItems = [] }) {
  const navigate = useNavigate();

  const defaultSchedule = [
    {
      id: 1,
      time: "09:00 - 10:00 AM",
      title: "Team Stand-up",
      subtitle: "Microsoft Teams",
      icon: <Videocam fontSize="small" />,
      color: { bg: "#DBEAFE", text: "#2563EB", dot: "#2563EB" },
    },
    {
      id: 2,
      time: "11:00 - 12:00 PM",
      title: "Project Discussion",
      subtitle: "Conference Room A",
      icon: <MeetingRoom fontSize="small" />,
      color: { bg: "#D1FAE5", text: "#059669", dot: "#10B981" },
    },
    {
      id: 3,
      time: "02:00 - 04:00 PM",
      title: "Client Review Meeting",
      subtitle: "Meeting Room 2",
      icon: <Groups fontSize="small" />,
      color: { bg: "#FEE2E2", text: "#DC2626", dot: "#2563EB" },
    },
  ];

  const displayItems = scheduleItems.length > 0 ? scheduleItems : defaultSchedule;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(10, 22, 40, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800} color="#0A1628" sx={{ fontSize: "1.05rem" }}>
          Today's Schedule
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

      {/* Timeline List */}
      <Stack spacing={2} sx={{ position: "relative" }}>
        {/* Vertical Connecting Line */}
        <Box
          sx={{
            position: "absolute",
            left: 6,
            top: 15,
            bottom: 15,
            width: 2,
            bgcolor: "#E2E8F0",
            zIndex: 0,
          }}
        />

        {displayItems.map((item, idx) => (
          <Box key={item.id || idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1 }}>
            {/* Timeline Dot */}
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: item.color?.dot || "#2563EB",
                boxShadow: "0 0 0 3px #FFFFFF",
                flexShrink: 0,
              }}
            />

            {/* Time String */}
            <Typography
              variant="caption"
              fontWeight={600}
              color="#64748B"
              sx={{ width: 120, flexShrink: 0, fontSize: "0.76rem" }}
            >
              {item.time}
            </Typography>

            {/* Item Card Container */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.2,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                border: "1px solid #F1F5F9",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: item.color?.bg || "#DBEAFE",
                    color: item.color?.text || "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon || <Groups fontSize="small" />}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={800} color="#0A1628" sx={{ fontSize: "0.82rem", lineHeight: 1.1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="#64748B" sx={{ fontSize: "0.7rem" }}>
                    {item.subtitle || item.location}
                  </Typography>
                </Box>
              </Box>

              <IconButton size="small" sx={{ color: "#94A3B8" }}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
