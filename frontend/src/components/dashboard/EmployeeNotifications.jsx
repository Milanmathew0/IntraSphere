import React from "react";
import { Box, Paper, Typography, Stack, Button, IconButton } from "@mui/material";
import {
  CheckCircle,
  FlightTakeoff,
  Campaign,
  Desk,
  MoreVert,
} from "@mui/icons-material";

export default function EmployeeNotifications() {
  const notifications = [
    {
      id: 1,
      title: "Your meeting room booking is confirmed.",
      time: "2 hours ago",
      icon: <CheckCircle sx={{ fontSize: 18, color: "#10B981" }} />,
      iconBg: "#DCFCE7",
      isUnread: true,
      hasMenu: true,
    },
    {
      id: 2,
      title: "Leave request approved.",
      time: "5 hours ago",
      icon: <FlightTakeoff sx={{ fontSize: 18, color: "#2563EB" }} />,
      iconBg: "#E0F2FE",
      isUnread: true,
      hasMenu: false,
    },
    {
      id: 3,
      title: "New announcement posted.",
      time: "1 day ago",
      icon: <Campaign sx={{ fontSize: 18, color: "#EF4444" }} />,
      iconBg: "#FEE2E2",
      isUnread: false,
      hasMenu: true,
    },
    {
      id: 4,
      title: "Workspace booking reminder.",
      time: "1 day ago",
      icon: <Desk sx={{ fontSize: 18, color: "#0284C7" }} />,
      iconBg: "#E0F2FE",
      isUnread: false,
      hasMenu: false,
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
          My Notifications
        </Typography>
        <Button
          size="small"
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
              border: "1px solid #E2E8F0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flex: 1, overflow: "hidden" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ fontSize: "0.78rem", lineHeight: 1.2 }} noWrap>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.7rem", display: "block", mt: 0.2 }}>
                  {item.time}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {item.isUnread && (
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563EB", mx: 0.5 }} />
              )}
              {item.hasMenu && (
                <IconButton size="small" sx={{ color: "#94A3B8" }}>
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
