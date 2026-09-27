import React, { useState } from "react";
import {
  Box,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Search,
  Notifications,
  Menu as MenuIcon,
  PersonOutlined,
  Logout,
  Settings,
  HelpOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeHeader({
  onMobileToggle,
  notificationsCount = 0,
  searchQuery = "",
  onSearchChange,
  onNotificationClick,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const employeeName = user?.username || user?.email?.split("@")[0] || "Employee";
  const employeeRole = user?.role || "Employee";
  const userInitials = employeeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  return (
    <Box
      sx={{
        height: 70,
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        px: { xs: 2, md: 3.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Left: Mobile Toggle & Global Search Bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, maxWidth: 550 }}>
        <IconButton
          onClick={onMobileToggle}
          edge="start"
          sx={{
            display: { md: "none" },
            color: "#0F172A",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Input Container */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 380, md: 450 },
            px: 2,
            py: 0.75,
            borderRadius: "12px",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            transition: "all 0.2s ease",
            "&:focus-within": {
              borderColor: "#1976D2",
              bgcolor: "#FFFFFF",
              boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
            },
          }}
        >
          <Search sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search for meeting rooms, workspaces, employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            sx={{
              flex: 1,
              fontSize: "0.88rem",
              color: "#0F172A",
              "& input::placeholder": {
                color: "#94A3B8",
                opacity: 1,
              },
            }}
          />
        </Paper>
      </Box>

      {/* Right: Notifications & User Profile Menu */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Notification Bell */}
        <Tooltip title="Notifications">
          <IconButton
            onClick={onNotificationClick}
            sx={{
              color: "#475569",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              p: 1.1,
              "&:hover": { bgcolor: "#F1F5F9", color: "#1976D2" },
            }}
          >
            <Badge
              badgeContent={notificationsCount}
              color="error"
              variant={notificationsCount > 0 ? "standard" : "dot"}
              invisible={notificationsCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: "#EF4444",
                },
              }}
            >
              <Notifications sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile Pill & Dropdown Trigger */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            px: 1.5,
            py: 0.75,
            borderRadius: "12px",
            cursor: "pointer",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
              borderColor: "#CBD5E1",
            },
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#1976D2",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 2px 6px rgba(25, 118, 210, 0.3)",
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              fontWeight={700}
              color="#0F172A"
              sx={{ fontSize: "0.85rem", lineHeight: 1.2 }}
            >
              {employeeName}
            </Typography>
            <Typography
              variant="caption"
              color="#64748B"
              sx={{ fontSize: "0.7rem", fontWeight: 500 }}
            >
              {employeeRole}
            </Typography>
          </Box>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
              p: 0.5,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
              {employeeName}
            </Typography>
            <Typography variant="caption" color="#64748B" display="block">
              {user?.email || "employee@intrasphere.com"}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5, borderColor: "#F1F5F9" }} />

          <MenuItem onClick={handleProfileClick} sx={{ borderRadius: "8px", py: 1 }}>
            <ListItemIcon>
              <PersonOutlined fontSize="small" sx={{ color: "#475569" }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>My Profile</Typography>}
            />
          </MenuItem>

          <MenuItem onClick={() => navigate("/profile")} sx={{ borderRadius: "8px", py: 1 }}>
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: "#475569" }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>Account Settings</Typography>}
            />
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: "#F1F5F9" }} />

          <MenuItem onClick={handleLogout} sx={{ borderRadius: "8px", py: 1, color: "#EF4444" }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: "#EF4444" }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#EF4444" }}>Log Out</Typography>}
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
