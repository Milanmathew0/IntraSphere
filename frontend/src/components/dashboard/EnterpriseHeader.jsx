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
import { BrandLogo } from "../BrandLogo";
import UserProfileHeader from "./UserProfileHeader";

export default function EnterpriseHeader({ user, onLogout }) {
  const email = user?.email || localStorage.getItem("email") || "Employee";
  const username = user?.username || email.split("@")[0];

  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Realtime live clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " • " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setCurrentTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const openNotifications = Boolean(anchorEl);

  const notificationsList = [
    { id: "1", title: "Check-in Status", text: "You are active on Floor 3 HQ", time: "5 mins ago", icon: <CheckCircle2 size={16} color="#16A34A" /> },
    { id: "2", title: "Room Booking", text: "Emergency War Room Alpha reserved for 2:00 PM", time: "1 hour ago", icon: <Info size={16} color="#2563EB" /> },
    { id: "3", title: "System Notice", text: "Scheduled system maintenance on Sunday 2:00 AM", time: "3 hours ago", icon: <AlertTriangle size={16} color="#D97706" /> },
  ];

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          color: "text.primary",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
            {/* Brand Logo */}
            <BrandLogo size="medium" />

            {/* Right Header Section: Live Clock, Notifications, Profile & Logout */}
            <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} alignItems="center">
              {/* Live Time Display */}
              <Paper
                elevation={0}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: "10px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Clock size={16} color="#2563EB" />
                <Typography variant="body2" fontWeight={600} color="#334155">
                  {currentTimeStr}
                </Typography>
              </Paper>

              {/* Notification Icon */}
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  p: 1,
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <Badge badgeContent={3} color="primary">
                  <Bell size={20} color="#475569" />
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
            width: 320,
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid #E2E8F0",
            mt: 1.5,
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
            Notifications
          </Typography>
          <Chip label="3 Unread" size="small" color="primary" sx={{ height: 20, fontSize: "0.68rem" }} />
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notificationsList.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem sx={{ py: 1.5, px: 2, "&:hover": { bgcolor: "#F8FAFC" } }}>
                <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600} color="#0F172A">{item.title}</Typography>}
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">{item.text}</Typography>
                      <Typography variant="caption" color="#94A3B8">{item.time}</Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Popover>
    </>
  );
}
