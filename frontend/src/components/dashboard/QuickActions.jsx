import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  Groups,
  Desk,
  FlightTakeoff,
  CalendarToday,
  BookmarkBorder,
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
      cardBg: "#F3E8FF", // Light purple
      textColor: "#6B21A8",
      route: "/meeting-rooms",
    },
    {
      id: "workspaces",
      label: "Reserve Workspace",
      icon: <Desk sx={{ fontSize: 26, color: "#0284C7" }} />,
      cardBg: "#E0F2FE", // Light blue
      textColor: "#0369A1",
      route: "/workspaces",
    },
    {
      id: "leave",
      label: "Apply Leave",
      icon: <FlightTakeoff sx={{ fontSize: 26, color: "#EA580C" }} />,
      cardBg: "#FFEDD5", // Light orange
      textColor: "#C2410C",
      route: "/leave",
    },
    {
      id: "attendance",
      label: "View Attendance",
      icon: <CalendarToday sx={{ fontSize: 24, color: "#16A34A" }} />,
      cardBg: "#DCFCE7", // Light green
      textColor: "#15803D",
      route: "/attendance",
    },
    {
      id: "my-bookings",
      label: "My Bookings",
      icon: <BookmarkBorder sx={{ fontSize: 26, color: "#DC2626" }} />,
      cardBg: "#FEE2E2", // Light pink/red
      textColor: "#B91C1C",
      route: "/my-bookings",
    },
    {
      id: "profile",
      label: "Update Profile",
      icon: <Person sx={{ fontSize: 26, color: "#2563EB" }} />,
      cardBg: "#E0E7FF", // Light indigo
      textColor: "#1D4ED8",
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
        borderRadius: "18px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        {actions.map((act) => (
          <Grid xs={6} sm={4} key={act.id}>
            <Paper
              elevation={0}
              onClick={() => handleClick(act)}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: act.cardBg,
                cursor: "pointer",
                transition: "all 0.2s ease",
                height: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                boxSizing: "border-box",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                },
              }}
            >
              <Box sx={{ mb: 0.8 }}>{act.icon}</Box>
              <Typography
                variant="body2"
                fontWeight={700}
                color={act.textColor}
                sx={{ fontSize: "0.78rem", lineHeight: 1.2, maxW: 90 }}
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
