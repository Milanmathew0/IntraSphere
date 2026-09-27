import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import {
  NotificationsActive,
  Settings,
  Groups,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function RecentAnnouncements() {
  const navigate = useNavigate();

  const announcements = [
    {
      id: 1,
      title: "Office Holiday Notice",
      date: "22 Sep 2026",
      description: "The office will remain closed on 2nd October 20...",
      icon: <NotificationsActive fontSize="small" />,
      color: { bg: "#F3E8FF", text: "#7E22CE" },
    },
    {
      id: 2,
      title: "IT Maintenance",
      date: "20 Sep 2026",
      description: "Scheduled system maintenance on 23rd Septe...",
      icon: <Settings fontSize="small" />,
      color: { bg: "#FFEDD5", text: "#EA580C" },
    },
    {
      id: 3,
      title: "Team Building Event",
      date: "18 Sep 2026",
      description: "Join us for the annual team building event on 28...",
      icon: <Groups fontSize="small" />,
      color: { bg: "#F3E8FF", text: "#7E22CE" },
    },
    {
      id: 4,
      title: "New Workspace Guidelines",
      date: "15 Sep 2026",
      description: "Updated workspace usage guidelines are now a...",
      icon: <Description fontSize="small" />,
      color: { bg: "#FFEDD5", text: "#EA580C" },
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
          Recent Announcements
        </Typography>
        <Button
          size="small"
          onClick={() => navigate("/announcements")}
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

      {/* List matching reference */}
      <Stack spacing={1.5}>
        {announcements.map((item) => (
          <Box key={item.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                bgcolor: item.color.bg,
                color: item.color.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: 0.2,
              }}
            >
              {item.icon}
            </Box>

            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="body2" fontWeight={800} color="#0A1628" sx={{ fontSize: "0.84rem", lineHeight: 1.2 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.7rem", fontWeight: 500, flexShrink: 0 }}>
                  {item.date}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="#64748B"
                sx={{
                  fontSize: "0.74rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mt: 0.2,
                }}
              >
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
