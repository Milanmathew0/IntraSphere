import React from "react";
import { Grid, Paper, Box, Typography, Stack } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import BuildIcon from "@mui/icons-material/Build";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpcomingIcon from "@mui/icons-material/Upcoming";

export default function FacilitySummaryCards({ stats, loading }) {
  const summary = stats?.summary || {};

  const cards = [
    {
      title: "Total Meeting Rooms",
      value: summary.total_meeting_rooms ?? "—",
      subText: `${summary.available_meeting_rooms ?? 0} Available`,
      icon: MeetingRoomIcon,
      color: "#F97316",
      bgColor: "#FFF7ED",
    },
    {
      title: "Available Rooms",
      value: summary.available_meeting_rooms ?? "—",
      subText: `${summary.total_meeting_rooms ?? 0} Total Rooms`,
      icon: CheckCircleOutlinedIcon,
      color: "#2E7D32",
      bgColor: "#E8F5E9",
    },
    {
      title: "Rooms Under Maintenance",
      value: summary.maintenance_rooms ?? "0",
      subText: `${summary.inactive_rooms ?? 0} Inactive`,
      icon: BuildIcon,
      color: "#ED6C02",
      bgColor: "#FFF3E0",
    },
    {
      title: "Total Workspaces / Desks",
      value: summary.total_workspaces ?? "—",
      subText: `${summary.available_workspaces ?? 0} Available`,
      icon: DesktopWindowsIcon,
      color: "#C2410C",
      bgColor: "#FFF7ED",
    },
    {
      title: "Available Desks",
      value: summary.available_workspaces ?? "—",
      subText: `${summary.total_workspaces ?? 0} Total Desks`,
      icon: EventSeatIcon,
      color: "#388E3C",
      bgColor: "#E8F5E9",
    },
    {
      title: "Desks Under Maintenance",
      value: summary.maintenance_workspaces ?? "0",
      subText: `${summary.inactive_workspaces ?? 0} Inactive`,
      icon: WarningAmberIcon,
      color: "#D32F2F",
      bgColor: "#FFEBEE",
    },
    {
      title: "Today's Reservations",
      value: summary.today_reservations ?? "0",
      subText: "Room & Desk Bookings Today",
      icon: CalendarTodayIcon,
      color: "#7B1FA2",
      bgColor: "#F3E5F5",
    },
    {
      title: "Upcoming Reservations",
      value: summary.upcoming_reservations ?? "0",
      subText: "Scheduled Future Bookings",
      icon: UpcomingIcon,
      color: "#00796B",
      bgColor: "#E0F2F1",
    },
  ];

  return (
    <Grid container spacing={2.5} mb={4}>
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                  borderColor: c.color,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    bgcolor: c.bgColor,
                    color: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent sx={{ fontSize: 26 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" noWrap>
                    {c.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" lineHeight={1.2}>
                    {c.value}
                  </Typography>
                  <Typography variant="caption" color="#64748B" sx={{ fontSize: "0.72rem" }}>
                    {c.subText}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
