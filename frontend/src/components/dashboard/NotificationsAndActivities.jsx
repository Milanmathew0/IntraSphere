import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";

export function NotificationsAndActivities() {
  const notifications = [
    {
      id: 1,
      title: "Room Reservation Confirmed",
      subtitle: "Emergency War Room Alpha reserved for today at 02:00 PM.",
      time: "10 mins ago",
      type: "booking",
      icon: <CheckCircleIcon color="success" fontSize="small" />,
    },
    {
      id: 2,
      title: "Annual Townhall Meeting",
      subtitle: "Company-wide Q3 strategy sync scheduled for Friday 10:00 AM.",
      time: "2 hours ago",
      type: "event",
      icon: <CampaignIcon color="primary" fontSize="small" />,
    },
    {
      id: 3,
      title: "Desk Booking Reminder",
      subtitle: "Silent Call Pod #A4 is ready for your 10:30 AM session.",
      time: "4 hours ago",
      type: "reminder",
      icon: <ScheduleIcon color="warning" fontSize="small" />,
    },
  ];

  const upcomingActivities = [
    {
      title: "Team Sprint Demo",
      time: "Today • 04:30 PM",
      location: "Main Boardroom (Hybrid)",
    },
    {
      title: "Building Safety Orientation",
      time: "Tomorrow • 11:00 AM",
      location: "Auditorium - Floor 1",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 4,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#FFF3E0", color: "#E65100", width: 42, height: 42 }}>
              <NotificationsActiveIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Notifications & Activities
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Recent updates and upcoming office events
              </Typography>
            </Box>
          </Box>
          <Chip label="3 New" color="warning" size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        {/* Notifications feed */}
        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>
          RECENT NOTIFICATIONS
        </Typography>

        <List disablePadding sx={{ mb: 3 }}>
          {notifications.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                <ListItemAvatar sx={{ minWidth: 36, mt: 0.5 }}>
                  {item.icon}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="600" color="#0F172A">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.subtitle}
                    </Typography>
                  }
                />
              </ListItem>
              {idx < notifications.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Upcoming Activities */}
        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1.5}>
          UPCOMING ACTIVITIES
        </Typography>

        <Stack spacing={1.5}>
          {upcomingActivities.map((act, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 1.5,
                border: "1px solid #E2E8F0",
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#E3F2FD", color: "#1976D2" }}>
                <EventIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="600" color="#1E293B">
                  {act.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  🕒 {act.time} • 📍 {act.location}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default NotificationsAndActivities;
