import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  IconButton,
} from "@mui/material";
import {
  Home,
  EventAvailable,
  FlightTakeoff,
  Groups,
  Desk,
  Bookmark,
  Campaign,
  Notifications,
  PersonOutlined,
  AutoAwesome as SparklesIcon,
  Close,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeSidebar({
  mobileOpen,
  onMobileClose,
  activeTab,
  onTabChange,
  unreadNotificationsCount = 3,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sidebarSections = [
    { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
    { label: "My Attendance", route: "/attendance", icon: <EventAvailable fontSize="small" />, tabId: "attendance" },
    { label: "Leave Application", route: "/leave", icon: <FlightTakeoff fontSize="small" />, tabId: "leave" },
    { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
    { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
    { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
    { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
    {
      label: "Notifications",
      route: "/notifications",
      icon: <Notifications fontSize="small" />,
      tabId: "notifications",
      badge: unreadNotificationsCount,
    },
    { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
  ];

  const handleNavClick = (item) => {
    if (onTabChange) {
      onTabChange(item.tabId);
    }
    if (location.pathname !== item.route) {
      navigate(item.route);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isItemActive = (item) => {
    if (activeTab) {
      return activeTab === item.tabId;
    }
    return location.pathname === item.route;
  };

  const sidebarContent = (
    <Box
      sx={{
        width: 240,
        height: "100%",
        bgcolor: "#0B132B", // Matching reference image deep dark navy
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2.2,
        boxSizing: "border-box",
      }}
    >
      <Box>
        {/* Brand Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            px: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              }}
            >
              <SparklesIcon sx={{ color: "#FFFFFF", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#FFFFFF"
                sx={{ letterSpacing: "-0.3px", lineHeight: 1.1, fontSize: "1.1rem" }}
              >
                IntraSphere
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.68rem" }}
              >
                Smart Office Management
              </Typography>
            </Box>
          </Box>

          {mobileOpen && (
            <IconButton onClick={onMobileClose} sx={{ color: "#94A3B8" }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Section Label */}
        <Typography
          variant="caption"
          sx={{
            color: "#64748B",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.5px",
            px: 1.5,
            mb: 1.5,
            display: "block",
          }}
        >
          Employee Portal
        </Typography>

        {/* Menu Items List */}
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {sidebarSections.map((item) => {
            const active = isItemActive(item);
            return (
              <ListItem key={item.tabId} disablePadding>
                <ListItemButton
                  onClick={() => handleNavClick(item)}
                  sx={{
                    borderRadius: "12px",
                    px: 1.6,
                    py: 1.0,
                    bgcolor: active ? "#2563EB" : "transparent",
                    color: active ? "#FFFFFF" : "#94A3B8",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: active ? "#2563EB" : "rgba(255, 255, 255, 0.06)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: active ? "#FFFFFF" : "#94A3B8",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.86rem",
                          fontWeight: active ? 700 : 500,
                          lineHeight: 1.2,
                          color: active ? "#FFFFFF" : "inherit",
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                  />

                  {/* Red Badge for Notifications */}
                  {item.badge > 0 && (
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#EF4444",
                        color: "#FFFFFF",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Architecture Building Card (Matching reference image) */}
      <Box
        sx={{
          borderRadius: "14px",
          overflow: "hidden",
          position: "relative",
          height: 130,
          background: "linear-gradient(180deg, rgba(11, 19, 43, 0.2) 0%, rgba(11, 19, 43, 0.9) 100%), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop') center/cover",
          p: 1.8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
          mt: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="#FFFFFF"
          sx={{ lineHeight: 1.2, fontSize: "0.9rem" }}
        >
          Smart People
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="#60A5FA"
          sx={{ lineHeight: 1.2, fontSize: "0.9rem" }}
        >
          Smarter Workspaces
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          width: { md: 240 },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 240,
            zIndex: 1200,
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            bgcolor: "#0B132B",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
