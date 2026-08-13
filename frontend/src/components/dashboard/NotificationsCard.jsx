import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Paper,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Check,
} from "lucide-react";

export default function NotificationsCard({ notifications = [] }) {
  const defaultNotifications = [
    {
      id: "1",
      title: "Room Reservation Confirmed",
      description: "Emergency War Room Alpha reserved for today at 02:00 PM.",
      time: "10 mins ago",
      type: "success",
      read: false,
    },
    {
      id: "2",
      title: "Annual Townhall Meeting",
      description: "Company-wide Q3 strategy sync scheduled for Friday 10:00 AM.",
      time: "2 hours ago",
      type: "info",
      read: false,
    },
    {
      id: "3",
      title: "Desk Booking Reminder",
      description: "Your Silent Call Pod #A4 reservation starts in 30 minutes.",
      time: "4 hours ago",
      type: "warning",
      read: true,
    },
  ];

  const list = notifications.length > 0 ? notifications : defaultNotifications;

  const getNotificationIcon = () => {
    return <Info size={16} color="#09090B" />;
  };

  const getNotificationBg = () => {
    return "#F4F4F5";
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 3.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: "12px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#09090B">
                Notifications & Activity
              </Typography>
              <Typography variant="caption" color="#71717A">
                Recent updates, reminders & office announcements
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${list.filter((n) => !n.read).length} New`}
            size="small"
            sx={{
              bgcolor: "#09090B",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.72rem",
              borderRadius: "8px",
            }}
          />
        </Stack>

        <Stack spacing={2} flexGrow={1}>
          {list.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: "1px solid #E4E4E7",
                bgcolor: !item.read ? "#FAFAFA" : "#FFFFFF",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "10px",
                    bgcolor: getNotificationBg(),
                    border: "1px solid #E4E4E7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 0.2,
                  }}
                >
                  {getNotificationIcon()}
                </Box>

                <Box flexGrow={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700} color="#09090B">
                      {item.title}
                    </Typography>
                    {!item.read && (
                      <Chip
                        label="Unread"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          bgcolor: "#F4F4F5",
                          color: "#09090B",
                          border: "1px solid #E4E4E7"
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="#71717A" mt={0.3} lineHeight={1.4}>
                    {item.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="#71717A"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    mt={1}
                  >
                    <Clock size={12} /> {item.time}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
