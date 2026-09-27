import React, { useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
  Chip,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Bell,
  LogOut,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "../BrandLogo";
import UserProfileHeader from "./UserProfileHeader";
import api from "../../api/axios";

export default function EnterpriseHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const email = user?.email || localStorage.getItem("email") || "Employee";
  const username = user?.username || email.split("@")[0];

  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openLoginPopup, setOpenLoginPopup] = useState(false);
  const [hasCheckedLoginPopup, setHasCheckedLoginPopup] = useState(false);

  // Realtime live clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " • " +
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setCurrentTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHeaderNotifications = async () => {
    try {
      const res = await api.get("/api/v1/notifications/my");
      const list = Array.isArray(res.data) ? res.data : [];
      setNotificationsList(list);
      const unreadList = list.filter((n) => !n.is_read);
      setUnreadCount(unreadList.length);

      // Auto-popup notification modal on initial login session if unread items exist
      if (!hasCheckedLoginPopup) {
        setHasCheckedLoginPopup(true);
        const seenInSession = sessionStorage.getItem("hasSeenLoginNotifications");
        if (!seenInSession && unreadList.length > 0) {
          setOpenLoginPopup(true);
        }
      }
    } catch (err) {
      console.error("Header notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHeaderNotifications();
    const interval = setInterval(fetchHeaderNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchHeaderNotifications();
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/api/v1/notifications/read-all");
      fetchHeaderNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseLoginPopup = () => {
    sessionStorage.setItem("hasSeenLoginNotifications", "true");
    setOpenLoginPopup(false);
  };

  const handleMarkAllReadAndClosePopup = async () => {
    try {
      await api.patch("/api/v1/notifications/read-all");
      sessionStorage.setItem("hasSeenLoginNotifications", "true");
      setOpenLoginPopup(false);
      fetchHeaderNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const openNotifications = Boolean(anchorEl);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #022C22 0%, #064E3B 60%, #047857 100%)",
          color: "#FFFFFF",
          py: 0.5,
          boxShadow: "0 6px 22px rgba(2, 44, 34, 0.2)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
            {/* Brand Logo & Home Link */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/")}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                }}
              >
                <ShieldCheck size={22} color="#FFFFFF" />
              </Box>
              <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} color="#FFFFFF">
                IntraSphere
              </Typography>
            </Box>

            {/* Right Header Section: Live Clock, Notifications, Profile */}
            <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              {/* Live Time Display */}
              <Paper
                elevation={0}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: "50px",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Clock size={16} color="#10B981" />
                <Typography variant="body2" fontWeight={700} color="#FFFFFF">
                  {currentTimeStr}
                </Typography>
              </Paper>

              {/* Notification Bell Button with Pulsing Ring Indicator */}
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  bgcolor: unreadCount > 0 ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.1)",
                  border: unreadCount > 0 ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "50%",
                  p: 1,
                  color: "#FFFFFF",
                  transition: "all 0.3s ease",
                  animation: unreadCount > 0 ? "pulseRing 2s infinite" : "none",
                  "&:hover": { bgcolor: unreadCount > 0 ? "rgba(239, 68, 68, 0.35)" : "rgba(255, 255, 255, 0.2)" },
                  "@keyframes pulseRing": {
                    "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(239, 68, 68, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      boxShadow: unreadCount > 0 ? "0 0 8px rgba(239, 68, 68, 0.8)" : "none",
                    },
                  }}
                >
                  <Bell size={18} color={unreadCount > 0 ? "#FECACA" : "#FFFFFF"} />
                </Badge>
              </IconButton>

              {/* User Profile Header Component */}
              <UserProfileHeader user={user} onLogout={onLogout} />
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Notifications Popover */}
      <Popover
        open={openNotifications}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 340,
            maxHeight: 450,
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            border: "1px solid #E2E8F0",
            mt: 1.5,
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
            Notifications
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${unreadCount} Unread`}
              size="small"
              sx={{
                bgcolor: unreadCount > 0 ? "#FFEBEE" : "#E6F4EA",
                color: unreadCount > 0 ? "#C62828" : "#059669",
                fontWeight: 700,
                height: 20,
                fontSize: "0.68rem",
              }}
            />
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 700 }}
                onClick={handleMarkAllRead}
              >
                Clear
              </Typography>
            )}
          </Stack>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notificationsList.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          ) : (
            notificationsList.map((item) => (
              <React.Fragment key={item._id || item.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: !item.is_read ? "#FEF2F2" : "#FFFFFF",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.title?.includes("Cancelled") ? (
                      <AlertTriangle size={18} color="#DC2626" />
                    ) : item.title?.includes("Confirmed") ? (
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : (
                      <Info size={18} color="#059669" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.message || item.text}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : item.time || ""}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>

      {/* Login Notification Dialog Popup */}
      <Dialog
        open={openLoginPopup}
        onClose={handleCloseLoginPopup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            border: "1px solid #FCA5A5",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: "14px",
              bgcolor: "#FEF2F2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              New Notification Alert
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You have {unreadCount} unread update{unreadCount > 1 ? "s" : ""} on your account
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
          <Stack spacing={2}>
            {notificationsList
              .filter((n) => !n.is_read)
              .map((item) => (
                <Paper
                  key={item._id || item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: item.title?.includes("Cancelled") ? "#FEF2F2" : "#F8FAFC",
                    border: item.title?.includes("Cancelled") ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ mt: 0.3 }}>
                      {item.title?.includes("Cancelled") ? (
                        <AlertTriangle size={20} color="#DC2626" />
                      ) : (
                        <Info size={20} color="#10B981" />
                      )}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="#334155" mt={0.5} lineHeight={1.4}>
                        {item.message || item.text}
                      </Typography>
                      <Typography variant="caption" color="#94A3B8" display="flex" alignItems="center" gap={0.5} mt={1}>
                        <Clock size={12} />
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={handleCloseLoginPopup}
            sx={{ borderRadius: "10px", textTransform: "none", color: "#64748B", fontWeight: 600 }}
          >
            Dismiss
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleMarkAllReadAndClosePopup}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Mark All as Read
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
