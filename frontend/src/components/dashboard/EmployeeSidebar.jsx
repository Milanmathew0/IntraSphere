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
  TrendingUp,
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
  const employeeRole = user?.role || localStorage.getItem("role") || "Employee";
  const userInitials = employeeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const getRoleSidebarSections = (role) => {
    switch (role) {
      case "Admin":
        return {
          portalLabel: "Admin Portal",
          sections: [
            { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
            { label: "Employee Directory", route: "/employees", icon: <Groups fontSize="small" />, tabId: "employees" },
            { label: "Performance & Punctuality", route: "/performance-overview", icon: <TrendingUp fontSize="small" />, tabId: "performance" },
            { label: "Leave Management", route: "/leave", icon: <FlightTakeoff fontSize="small" />, tabId: "leave" },
            { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
            { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
            { label: "Facility Management", route: "/facility-management", icon: <Desk fontSize="small" />, tabId: "facility" },
            { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
            { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
            { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
          ],
        };

      case "Manager":
        return {
          portalLabel: "Manager Portal",
          sections: [
            { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
            { label: "Team Attendance", route: "/attendance", icon: <EventAvailable fontSize="small" />, tabId: "attendance" },
            { label: "Performance & Punctuality", route: "/performance-overview", icon: <TrendingUp fontSize="small" />, tabId: "performance" },
            { label: "Leave Approvals", route: "/leave", icon: <FlightTakeoff fontSize="small" />, tabId: "leave" },
            { label: "Staff Directory", route: "/employees", icon: <Groups fontSize="small" />, tabId: "employees" },
            { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
            { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
            { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
            { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
            { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
            { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
          ],
        };

      case "Facility Manager":
        return {
          portalLabel: "Facility Portal",
          sections: [
            { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
            { label: "Facility Management", route: "/facility-management", icon: <Desk fontSize="small" />, tabId: "facility" },
            { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
            { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
            { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
            { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
            { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
            { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
          ],
        };

      case "User":
        return {
          portalLabel: "User Portal",
          sections: [
            { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
            { label: "Company Directory", route: "/employees", icon: <Groups fontSize="small" />, tabId: "employees" },
            { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
            { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
            { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
            { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
            { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
            { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
          ],
        };

      case "Employee":
      case "HR":
      default:
        return {
          portalLabel: role === "HR" ? "HR Portal" : "Employee Portal",
          sections: [
            { label: "Dashboard", route: "/dashboard", icon: <Home fontSize="small" />, tabId: "dashboard" },
            { label: "My Attendance", route: "/attendance", icon: <EventAvailable fontSize="small" />, tabId: "attendance" },
            { label: "Leave Application", route: "/leave", icon: <FlightTakeoff fontSize="small" />, tabId: "leave" },
            { label: "Meeting Rooms", route: "/meeting-rooms", icon: <Groups fontSize="small" />, tabId: "meeting-rooms" },
            { label: "Workspace Booking", route: "/workspaces", icon: <Desk fontSize="small" />, tabId: "workspaces" },
            { label: "My Bookings", route: "/my-bookings", icon: <Bookmark fontSize="small" />, tabId: "my-bookings" },
            { label: "Announcements", route: "/announcements", icon: <Campaign fontSize="small" />, tabId: "announcements" },
            { label: "Notifications", route: "/notifications", icon: <Notifications fontSize="small" />, tabId: "notifications" },
            { label: "My Profile", route: "/profile", icon: <PersonOutlined fontSize="small" />, tabId: "profile" },
          ],
        };
    }
  };

  const { portalLabel, sections: sidebarSections } = getRoleSidebarSections(employeeRole);

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
    navigate("/");
  };

  const isItemActive = (item) => {
    if (activeTab && activeTab === item.tabId) {
      return true;
    }
    return location.pathname === item.route;
  };

  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        bgcolor: "#FFFFFF", // Clean Pristine Light Theme Sidebar
        color: "#0F172A",
        borderRight: "1px solid #E2E8F0",
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
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
              }}
            >
              <SparklesIcon style={{ color: "#FFFFFF", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#0F172A"
                sx={{ letterSpacing: -0.3, lineHeight: 1.2 }}
              >
                IntraSphere
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748B", fontWeight: 500, fontSize: "0.7rem" }}
              >
                Smart Office System
              </Typography>
            </Box>
          </Box>

          {/* Close button for Mobile Drawer */}
          {mobileOpen && (
            <IconButton
              onClick={onMobileClose}
              sx={{ color: "#64748B", "&:hover": { color: "#0F172A" } }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Section Label */}
        <Typography
          variant="caption"
          sx={{
            color: "#94A3B8",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: 1.1,
            px: 1.5,
            mb: 1.5,
            display: "block",
            textTransform: "uppercase",
          }}
        >
          {portalLabel}
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
                    bgcolor: active ? "#F97316" : "transparent",
                    color: active ? "#FFFFFF" : "#475569",
                    boxShadow: active ? "0 4px 14px rgba(249, 115, 22, 0.35)" : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: active ? "#EA580C" : "#FFF7ED",
                      color: active ? "#FFFFFF" : "#F97316",
                      transform: "translateX(3px)",
                      "& .MuiListItemIcon-root": {
                        color: active ? "#FFFFFF" : "#F97316",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: active ? "#FFFFFF" : "#64748B",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.86rem",
                          fontWeight: active ? 700 : 600,
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
      <Box sx={{ pt: 2, borderTop: "1px solid #E2E8F0" }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "14px",
            bgcolor: "#FAF8F5",
            border: "1px solid #E2E8F0",
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
                bgcolor: "#F97316",
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
                color="#0F172A"
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
                  bgcolor: "#FFF7ED",
                  color: "#C2410C",
                  border: "1px solid #FFEDD5",
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
                color: "#EF4444",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#FEF2F2" },
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
            boxShadow: "2px 0 16px rgba(15, 23, 42, 0.04)",
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
            bgcolor: "#FFFFFF",
            borderRight: "1px solid #E2E8F0",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
