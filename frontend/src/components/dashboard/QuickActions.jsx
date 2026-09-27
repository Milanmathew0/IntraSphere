import React from "react";
import { Box, Grid, Paper, Typography, Stack } from "@mui/material";
import {
  Groups,
  Desk,
  FlightTakeoff,
  CalendarMonth,
  Bookmark,
  Person,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ onActionClick }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: "meeting-rooms",
      label: "Book Meeting Room",
      subtitle: "Reserve war room or call pod",
      icon: <Groups sx={{ fontSize: 24, color: "#F97316" }} />,
      iconBg: "#E0F2FE",
      route: "/meeting-rooms",
    },
    {
      id: "workspaces",
      label: "Reserve Workspace",
      subtitle: "Book hot desk or quiet station",
      icon: <Desk sx={{ fontSize: 24, color: "#7E22CE" }} />,
      iconBg: "#F3E8FF",
      route: "/workspaces",
    },
    {
      id: "leave",
      label: "Apply Leave",
      subtitle: "Submit time off or vacation",
      icon: <FlightTakeoff sx={{ fontSize: 24, color: "#15803D" }} />,
      iconBg: "#DCFCE7",
      route: "/leave",
    },
    {
      id: "attendance",
      label: "View Attendance",
      subtitle: "Inspect monthly punch log",
      icon: <CalendarMonth sx={{ fontSize: 24, color: "#B45309" }} />,
      iconBg: "#FEF3C7",
      route: "/attendance",
    },
    {
      id: "my-bookings",
      label: "My Bookings",
      subtitle: "Manage active room & desk passes",
      icon: <Bookmark sx={{ fontSize: 24, color: "#C2410C" }} />,
      iconBg: "#FFEDD5",
      route: "/my-bookings",
    },
    {
      id: "profile",
      label: "Update Profile",
      subtitle: "Edit user info & preferences",
      icon: <Person sx={{ fontSize: 24, color: "#0F172A" }} />,
      iconBg: "#F1F5F9",
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
    <Box>
      <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2, letterSpacing: "-0.3px" }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        {actions.map((act) => (
          <Grid xs={12} sm={6} md={4} key={act.id}>
            <Paper
              elevation={0}
              onClick={() => handleClick(act)}
              sx={{
                p: 2.2,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: "#F97316",
                  boxShadow: "0 8px 24px rgba(249, 115, 22, 0.12)",
                  transform: "translateY(-2px)",
                  "& .action-arrow": {
                    transform: "translateX(4px)",
                    color: "#F97316",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: act.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {act.icon}
                </Box>
                <Box sx={{ overflow: "hidden" }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                    {act.label}
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block" mt={0.3} noWrap>
                    {act.subtitle}
                  </Typography>
                </Box>
              </Box>

              <ArrowForward
                className="action-arrow"
                sx={{
                  fontSize: 18,
                  color: "#94A3B8",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
