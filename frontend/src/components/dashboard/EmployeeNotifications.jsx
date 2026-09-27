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
  CheckCircle,
  FlightTakeoff,
  Campaign,
  Desk,
  MoreVert,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function EmployeeNotifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      text: "Your meeting room booking is confirmed.",
      time: "2 hours ago",
      icon: <CheckCircle fontSize="small" />,
      color: { bg: "#DCFCE7", text: "#16A34A" },
      unread: true,
    },
    {
      id: 2,
      text: "Leave request approved.",
      time: "5 hours ago",
      icon: <FlightTakeoff fontSize="small" />,
      color: { bg: "#E0F2FE", text: "#0284C7" },
      unread: true,
    },
    {
      id: 3,
      text: "New announcement posted.",
      time: "1 day ago",
      icon: <Campaign fontSize="small" />,
      color: { bg: "#FFEDD5", text: "#EA580C" },
      unread: false,
    },
    {
      id: 4,
      text: "Workspace booking reminder.",
      time: "1 day ago",
      icon: <Desk fontSize="small" />,
      color: { bg: "#E0F2FE", text: "#0284C7" },
      unread: false,
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
          My Notifications
        </Typography>
        <Button
          size="small"
          onClick={() => navigate("/notifications")}
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

      {/* List matching reference image */}
      <Stack spacing={1.5}>
        {notifications.map((item) => (
          <Box
            key={item.id}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: item.color.bg,
                  color: item.color.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} color="#0A1628" sx={{ fontSize: "0.8rem", lineHeight: 1.2 }}>
                  {item.text}
                </Typography>
                <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.7rem", mt: 0.2, display: "block" }}>
                  {item.time}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {item.unread && (
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#2563EB",
                  }}
                />
              )}
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
