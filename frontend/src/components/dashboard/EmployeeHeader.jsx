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
  Paper,
} from "@mui/material";
import {
  Search,
  Notifications,
  Menu as MenuIcon,
  KeyboardArrowDown,
  PersonOutlined,
  Logout,
  Settings,
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

  const employeeName = user?.username || user?.first_name || "Milan Mathew";
  const employeeRole = user?.designation || user?.role || "Software Intern";
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
        height: 64,
        bgcolor: "#F5F8FC", // Matching reference soft canvas
        px: { xs: 2, md: 3.5 },
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Left: Mobile Toggle & Search Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, maxWidth: 580 }}>
        <IconButton
          onClick={onMobileToggle}
          edge="start"
          sx={{
            display: { md: "none" },
            color: "#0F172A",
            bgcolor: "#FFFFFF",
            borderRadius: "10px",
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Pill Search Input */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 420, md: 520 },
            px: 2.5,
            py: 0.8,
            borderRadius: "30px", // Rounded pill input matching reference
            bgcolor: "#FFFFFF",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            border: "1px solid #E2E8F0",
            transition: "all 0.2s ease",
            "&:focus-within": {
              borderColor: "#2563EB",
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
            },
          }}
        >
          <Search sx={{ color: "#94A3B8", mr: 1.2, fontSize: 20 }} />
          <InputBase
            placeholder="Search for meeting rooms, workspaces, employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            sx={{
              flex: 1,
              fontSize: "0.85rem",
              color: "#0F172A",
              "& input::placeholder": {
                color: "#94A3B8",
                opacity: 1,
              },
            }}
          />
        </Paper>
      </Box>

      {/* Right Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Circular Notification Bell */}
        <IconButton
          onClick={onNotificationClick}
          sx={{
            bgcolor: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            border: "1px solid #E2E8F0",
            borderRadius: "50%",
            p: 1.1,
            "&:hover": { bgcolor: "#F8FAFC", color: "#2563EB" },
          }}
        >
          <Badge
            color="error"
            variant="dot"
            invisible={notificationsCount === 0}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#EF4444",
                width: 8,
                height: 8,
                borderRadius: "50%",
              },
            }}
          >
            <Notifications sx={{ fontSize: 20, color: "#475569" }} />
          </Badge>
        </IconButton>

        {/* Employee Profile Pill */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            p: 0.5,
            borderRadius: "24px",
            transition: "all 0.2s ease",
            "&:hover": { opacity: 0.85 },
          }}
        >
          <Avatar
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              fontWeight={700}
              color="#0F172A"
              sx={{ fontSize: "0.85rem", lineHeight: 1.1 }}
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
          <KeyboardArrowDown sx={{ color: "#64748B", fontSize: 18 }} />
        </Box>

        {/* Menu */}
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
              {user?.email || "milan.mathew@intrasphere.com"}
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
