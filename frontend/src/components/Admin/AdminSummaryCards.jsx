import React from "react";
import { Grid, Paper, Box, Typography, Skeleton } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const cardItems = [
  {
    key: "total_employees",
    title: "Total Employees",
    getValue: (data) => data?.employees?.total ?? 0,
    getSubtitle: (data) => `+${data?.employees?.new_this_month ?? 0} this month`,
    icon: PeopleAltIcon,
    color: "#1976D2",
    bgColor: "#E3F2FD",
  },
  {
    key: "active_employees",
    title: "Active Employees",
    getValue: (data) => data?.employees?.active ?? 0,
    getSubtitle: (data) => {
      const total = data?.employees?.total || 1;
      const pct = Math.round(((data?.employees?.active || 0) / total) * 100);
      return `${pct}% active workforce`;
    },
    icon: CheckCircleIcon,
    color: "#2E7D32",
    bgColor: "#E8F5E9",
  },
  {
    key: "todays_attendance",
    title: "Today's Attendance",
    getValue: (data) => `${data?.attendance?.present_today ?? 0} / ${data?.employees?.active ?? 0}`,
    getSubtitle: (data) => `${data?.attendance?.checked_in ?? 0} currently checked in`,
    icon: EventAvailableIcon,
    color: "#0288D1",
    bgColor: "#E0F7FA",
  },
  {
    key: "pending_leave",
    title: "Pending Leave Requests",
    getValue: (data) => data?.leave?.pending ?? 0,
    getSubtitle: (data) => `${data?.leave?.approved_today ?? 0} approved today`,
    icon: EventBusyIcon,
    color: "#D32F2F",
    bgColor: "#FFEBEE",
  },
  {
    key: "todays_bookings",
    title: "Today's Bookings",
    getValue: (data) => data?.meeting_rooms?.bookings_today ?? 0,
    getSubtitle: (data) => `${data?.meeting_rooms?.occupied ?? 0} occupied right now`,
    icon: MeetingRoomIcon,
    color: "#7B1FA2",
    bgColor: "#F3E5F5",
  },
  {
    key: "active_rooms",
    title: "Active Meeting Rooms",
    getValue: (data) => `${data?.meeting_rooms?.available ?? 0} / ${data?.meeting_rooms?.total ?? 0}`,
    getSubtitle: (data) => `${data?.meeting_rooms?.maintenance ?? 0} in maintenance`,
    icon: MeetingRoomOutlinedIcon,
    color: "#00796B",
    bgColor: "#E0F2F1",
  },
  {
    key: "notifications",
    title: "Unread Notifications",
    getValue: (data) => data?.notifications?.unread_count ?? 0,
    getSubtitle: () => "System alerts & updates",
    icon: NotificationsActiveIcon,
    color: "#C2185B",
    bgColor: "#FCE4EC",
  },
];

export default function AdminSummaryCards({ data, loading }) {
  return (
    <Grid container spacing={2.5}>
      {cardItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={item.key}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(25, 118, 210, 0.08)",
                  borderColor: item.color,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>
                    {item.title}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight={800} color="#0F172A">
                      {item.getValue(data)}
                    </Typography>
                  )}
                  {loading ? (
                    <Skeleton variant="text" width={120} height={20} />
                  ) : (
                    <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {item.getSubtitle(data)}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    bgcolor: item.bgColor,
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconComponent sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
