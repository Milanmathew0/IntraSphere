import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
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
  Close,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeSidebar({
  mobileOpen,
  onMobileClose,
  activeTab,
  onTabChange,
  notificationsCount = 3,
}) {
  const navigate = useNavigate();
  const location = useLocation();

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
      badge: notificationsCount,
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
        bgcolor: "#0A1628", // Exact Dark Navy Blue from reference
        color: "#FFFFFF",
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
              </svg>
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#FFFFFF"
                sx={{ letterSpacing: "-0.3px", lineHeight: 1.1, fontSize: "1.05rem" }}
              >
                IntraSphere
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#7C8BA1", fontWeight: 500, fontSize: "0.68rem" }}
              >
                Smart Office Management
              </Typography>
            </Box>
          </Box>

          {mobileOpen && (
            <IconButton
              onClick={onMobileClose}
              sx={{ color: "#7C8BA1", "&:hover": { color: "#FFFFFF" } }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Section Label */}
        <Typography
          variant="caption"
          sx={{
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: 1,
            px: 1.5,
            mb: 1.5,
            display: "block",
            textTransform: "uppercase",
          }}
        >
          Employee Portal
        </Typography>

        {/* Navigation Menu List */}
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
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
                    bgcolor: active ? "#2563EB" : "transparent",
                    color: active ? "#FFFFFF" : "#94A3B8",
                    boxShadow: active ? "0 4px 14px rgba(37, 99, 235, 0.4)" : "none",
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
                    {item.badge ? (
                      <Badge
                        badgeContent={item.badge}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            height: 16,
                            minWidth: 16,
                            px: 0.5,
                            bgcolor: "#EF4444",
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#FFFFFF" : "#94A3B8",
                    }}
                  >
                    {item.label}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Sidebar Image Card */}
      <Box
        sx={{
          mt: 3,
          borderRadius: "16px",
          height: 140,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(10, 22, 40, 0.2) 0%, rgba(10, 22, 40, 0.95) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="#FFFFFF"
          sx={{ lineHeight: 1.2, fontSize: "0.88rem" }}
        >
          Smart People
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="#60A5FA"
          sx={{ lineHeight: 1.2, fontSize: "0.88rem" }}
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
            boxShadow: "4px 0 20px rgba(10, 22, 40, 0.08)",
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
            bgcolor: "#0A1628",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
