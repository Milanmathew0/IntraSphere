import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  Notifications,
  DoneAll,
  CheckCircleOutlined,
  AccessTime,
  MarkEmailRead,
} from "@mui/icons-material";
import api from "../../api/axios";

export default function EmployeeNotifications({ onUnreadCountChange }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/notifications/my");
      const list = Array.isArray(response.data) ? response.data : [];
      setNotifications(list);

      const unreadCount = list.filter((n) => !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/v1/notifications/read-all");
      await fetchNotifications();
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const formatNotificationTime = (timeStr) => {
    if (!timeStr) return "Just now";
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#F3E8FF",
              color: "#7E22CE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Notifications sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            My Notifications
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Tooltip title="Mark all notifications as read">
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<DoneAll sx={{ fontSize: "14px !important" }} />}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "#10B981",
                textTransform: "none",
              }}
            >
              Mark All Read
            </Button>
          </Tooltip>
        )}
      </Stack>

      {/* List */}
      {loading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "12px" }} />
        </Stack>
      ) : notifications.length === 0 ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            textAlign: "center",
            borderRadius: "14px",
            bgcolor: "#F8FAFC",
            border: "1px dashed #CBD5E1",
          }}
        >
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            You have no notifications.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {notifications.slice(0, 5).map((item) => {
            const isRead = Boolean(item.is_read);
            return (
              <Paper
                key={item._id || item.id}
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: "14px",
                  bgcolor: isRead ? "#FFFFFF" : "#F0F7FF",
                  border: isRead ? "1px solid #E2E8F0" : "1px solid #A7F3D0",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ overflow: "hidden", pr: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.3}>
                    <Typography
                      variant="body2"
                      fontWeight={isRead ? 600 : 800}
                      color="#0F172A"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {item.title || item.message || "Notification"}
                    </Typography>
                    {!isRead && (
                      <Chip
                        label="New"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          bgcolor: "#10B981",
                          color: "#FFFFFF",
                          borderRadius: "4px",
                          "& .MuiChip-label": { px: 0.6 },
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" color="#475569" display="block" lineHeight={1.4}>
                    {item.message || item.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="#94A3B8"
                    display="flex"
                    alignItems="center"
                    gap={0.4}
                    mt={0.8}
                  >
                    <AccessTime sx={{ fontSize: 12 }} /> {formatNotificationTime(item.created_at || item.time)}
                  </Typography>
                </Box>

                {!isRead && (
                  <Tooltip title="Mark as read">
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(item._id || item.id)}
                      sx={{ color: "#10B981", p: 0.5 }}
                    >
                      <MarkEmailRead fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
