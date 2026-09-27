import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  Groups,
  Desk,
  FlightTakeoff,
  CalendarMonth,
  Bookmark,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ onActionClick }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: "meeting-rooms",
      label: "Book Meeting Room",
      icon: <Groups sx={{ fontSize: 26, color: "#7E22CE" }} />,
      bg: "#F3E8FF",
      route: "/meeting-rooms",
    },
    {
      id: "workspaces",
      label: "Reserve Workspace",
      icon: <Desk sx={{ fontSize: 26, color: "#0284C7" }} />,
      bg: "#E0F2FE",
      route: "/workspaces",
    },
    {
      id: "leave",
      label: "Apply Leave",
      icon: <FlightTakeoff sx={{ fontSize: 26, color: "#EA580C" }} />,
      bg: "#FFEDD5",
      route: "/leave",
    },
    {
      id: "attendance",
      label: "View Attendance",
      icon: <CalendarMonth sx={{ fontSize: 26, color: "#16A34A" }} />,
      bg: "#DCFCE7",
      route: "/attendance",
    },
    {
      id: "my-bookings",
      label: "My Bookings",
      icon: <Bookmark sx={{ fontSize: 26, color: "#DC2626" }} />,
      bg: "#FEE2E2",
      route: "/my-bookings",
    },
    {
      id: "profile",
      label: "Update Profile",
      icon: <Person sx={{ fontSize: 26, color: "#2563EB" }} />,
      bg: "#EFF6FF",
      route: "/profile",
    },
  ];

  const handleClick = (action) => {
    if (onActionClick) {
      onActionClick(action.id);
    }
    navigate(action.route);
  };

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
      <Typography variant="subtitle1" fontWeight={800} color="#0A1628" sx={{ mb: 2, fontSize: "1.05rem" }}>
        Quick Actions
      </Typography>

      <Grid container spacing={1.8}>
        {actions.map((act) => (
          <Grid xs={4} key={act.id}>
            <Paper
              elevation={0}
              onClick={() => handleClick(act)}
              sx={{
                p: 2,
                height: 95,
                borderRadius: "16px",
                bgcolor: act.bg,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Box sx={{ mb: 0.8 }}>{act.icon}</Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="#0A1628"
                sx={{ fontSize: "0.74rem", lineHeight: 1.15 }}
              >
                {act.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
