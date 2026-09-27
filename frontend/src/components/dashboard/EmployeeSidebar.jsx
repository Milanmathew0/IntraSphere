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
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Chip,
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
  Logout,
  AutoAwesome as SparklesIcon,
  ChevronRight,
  MenuOpen,
  Close,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeSidebar({
  mobileOpen,
  onMobileClose,
  activeTab,
  onTabChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const employeeName = user?.username || user?.email?.split("@")[0] || "Employee";
  const employeeRole = user?.role || "Employee";
  const userInitials = employeeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const baseSections = [
    { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
    { label: "My Attendance", route: "/attendance", icon: <EventAvailable fontSize="small" />, tabId: "attendance" },
    { label: "Leave Application", route: "/leave", icon: <FlightTakeoff fontSize="small" />, tabId: "leave" },
    { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
    { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
  ];

  if (["Admin", "Manager"].includes(employeeRole)) {
    baseSections.push({ label: "Employee Directory", route: "/employees", icon: <Groups fontSize="small" />, tabId: "employees" });
  }
  if (["Admin", "Facility Manager"].includes(employeeRole)) {
    baseSections.push({ label: "Facility Management", route: "/facility-management", icon: <Desk fontSize="small" />, tabId: "facility" });
  }

  baseSections.push(
    { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
    { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
    { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
    { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" }
  );

  const sidebarSections = baseSections;

  const handleNavClick = (item) => {
    if (onTabChange) {
      onTabChange(item.tabId);
    }
    // Also navigate if route is explicitly different or top-level route navigation is preferred
    if (location.pathname !== item.route) {
      navigate(item.route);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        width: 250,
        height: "100%",
        bgcolor: "#0F172A", // Professional Dark Navy Slate
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2.5,
        boxSizing: "border-box",
      }}
    >
      {/* Brand Header */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3.5,
            px: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "#1976D2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
              }}
            >
              <SparklesIcon style={{ color: "#FFFFFF", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#FFFFFF"
                sx={{ letterSpacing: -0.3, lineHeight: 1.2 }}
              >
                IntraSphere
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.7rem" }}
              >
                Smart Office System
              </Typography>
            </Box>
          </Box>

          {/* Close button for Mobile Drawer */}
          {mobileOpen && (
            <IconButton
              onClick={onMobileClose}
              sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}
            >
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
            letterSpacing: 1.1,
            px: 1.5,
            mb: 1.5,
            display: "block",
            textTransform: "uppercase",
          }}
        >
          Employee Portal
        </Typography>

        {/* Navigation Menu List */}
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
          {sidebarSections.map((item) => {
            const active = isItemActive(item);
            return (
              <ListItem key={item.tabId} disablePadding>
                <ListItemButton
                  onClick={() => handleNavClick(item)}
                  sx={{
                    borderRadius: "12px",
                    px: 1.8,
                    py: 1.1,
                    bgcolor: active ? "#1976D2" : "transparent",
                    color: active ? "#FFFFFF" : "#94A3B8",
                    boxShadow: active ? "0 4px 12px rgba(25, 118, 210, 0.35)" : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: active ? "#1976D2" : "rgba(255, 255, 255, 0.08)",
                      color: "#FFFFFF",
                      transform: "translateX(3px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: active ? "#FFFFFF" : "inherit",
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
                  {active && (
                    <ChevronRight
                      sx={{ fontSize: 16, color: "#FFFFFF", ml: 0.5 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Profile & Logout Card */}
      <Box sx={{ pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "14px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, overflow: "hidden" }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#1976D2",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="#FFFFFF"
                noWrap
                sx={{ fontSize: "0.82rem" }}
              >
                {employeeName}
              </Typography>
              <Chip
                label={employeeRole}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  bgcolor: "rgba(25, 118, 210, 0.25)",
                  color: "#60A5FA",
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            </Box>
          </Box>

          <Tooltip title="Sign Out">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: "#F87171",
                borderRadius: "8px",
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.15)" },
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: 250 },
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
            width: 250,
            zIndex: 1200,
            boxShadow: "4px 0 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      {/* Mobile / Tablet Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            bgcolor: "#0F172A",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
