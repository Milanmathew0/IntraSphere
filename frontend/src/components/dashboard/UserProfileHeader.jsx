import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Popover,
  Button,
  Divider,
  Paper,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ShieldCheck,
  LogOut,
  ChevronDown,
  User,
  CheckCircle2,
  Sparkles,
  Building,
} from "lucide-react";

export default function UserProfileHeader({
  user,
  onLogout,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const email = user?.email || localStorage.getItem("email") || "michael@gmail.com";
  const username = user?.username || email.split("@")[0] || "michael";
  const role = user?.role || localStorage.getItem("role") || "Registered User";

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Dynamic role configuration for badges & themes
  const getRoleConfig = () => {
    if (role === "Admin") {
      return {
        label: "Role: System Admin",
        color: "#09090B",
        bgColor: "#F4F4F5",
        borderColor: "#E4E4E7",
        gradient: "#09090B",
        pulse: false,
      };
    }
    if (role === "Facility Manager") {
      return {
        label: "Role: Facility Manager",
        color: "#1976D2",
        bgColor: "#E3F2FD",
        borderColor: "#90CAF9",
        gradient: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
        pulse: false,
      };
    }
    if (role === "Manager") {
      return {
        label: "Role: Team Manager",
        color: "#09090B",
        bgColor: "#F4F4F5",
        borderColor: "#E4E4E7",
        gradient: "#09090B",
        pulse: false,
      };
    }
    if (role === "Employee") {
      return {
        label: "Role: Verified Employee",
        color: "#09090B",
        bgColor: "#F4F4F5",
        borderColor: "#E4E4E7",
        gradient: "#09090B",
        pulse: false,
      };
    }
    // Default Registered User
    return {
      label: "Role: Registered User",
      color: "#09090B",
      bgColor: "#F4F4F5",
      borderColor: "#E4E4E7",
      gradient: "#09090B",
      pulse: false,
    };
  };

  const roleConfig = getRoleConfig();

  return (
    <>
      {/* Sleek Top-Right Header User Pill Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "nowrap",
        }}
      >
        {/* Role Badge Chip */}
        <Chip
          icon={
            <Box sx={{ display: "flex", alignItems: "center", mr: 0.5 }}>
              <ShieldCheck size={15} color={roleConfig.color} />
            </Box>
          }
          label={roleConfig.label}
          sx={{
            height: 34,
            bgcolor: roleConfig.bgColor,
            color: roleConfig.color,
            border: `1px solid ${roleConfig.borderColor}`,
            fontWeight: 700,
            fontSize: "0.78rem",
            px: 1,
            borderRadius: "12px",
            boxShadow: `0 2px 8px ${roleConfig.bgColor}`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: `0 4px 12px ${roleConfig.borderColor}`,
            },
          }}
        />

        {/* User Interactive Card / Trigger */}
        <Paper
          elevation={0}
          onClick={handleOpenMenu}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            px: 1.5,
            py: 0.6,
            borderRadius: "16px",
            bgcolor: open ? "#F1F5F9" : "rgba(255, 255, 255, 0.9)",
            border: open
              ? "1px solid #CBD5E1"
              : "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: open
              ? "0 4px 20px rgba(15, 23, 42, 0.08)"
              : "0 2px 10px rgba(15, 23, 42, 0.04)",
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              bgcolor: "#F8FAFC",
              borderColor: "#CBD5E1",
              boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
              transform: "translateY(-1px)",
              "& .chevron-icon": {
                transform: "translateY(1px)",
                color: "#0F172A",
              },
            },
          }}
        >
          {/* Avatar with Status Pulse Dot */}
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: roleConfig.gradient,
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#FFFFFF",
                boxShadow: "0 3px 10px rgba(15, 23, 42, 0.15)",
                border: "2px solid #FFFFFF",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#10B981",
                border: "2px solid #FFFFFF",
                boxShadow: "0 0 6px rgba(16, 185, 129, 0.8)",
              }}
            />
          </Box>

          {/* User Name & Email */}
          <Box sx={{ display: { xs: "none", sm: "block" }, pr: 0.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="#0F172A"
              lineHeight={1.25}
              sx={{ textTransform: "capitalize" }}
            >
              {username}
            </Typography>
            <Typography
              variant="caption"
              color="#64748B"
              fontWeight={500}
              display="block"
              sx={{
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "0.72rem",
              }}
            >
              {email}
            </Typography>
          </Box>

          {/* Chevron Dropdown Toggle */}
          <Box
            className="chevron-icon"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#64748B",
              transition: "all 0.3s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={18} />
          </Box>
        </Paper>

        {/* Direct Quick Logout Button */}
        <Tooltip title="Log out">
          <IconButton
            onClick={onLogout}
            sx={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              background: "#F4F4F5",
              border: "1px solid #E4E4E7",
              color: "#09090B",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "#09090B",
                borderColor: "#09090B",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <LogOut size={17} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Popover User Profile Menu */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
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
            width: 310,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px #E4E4E7",
            border: "none",
            mt: 1.5,
            background: "#FFFFFF",
          },
        }}
      >
        {/* Banner Top Header */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: "#09090B",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient Sheen */}
          <Box
            sx={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                background: roleConfig.gradient,
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#FFFFFF",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                border: "2.5px solid rgba(255, 255, 255, 0.9)",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="#FFFFFF"
                lineHeight={1.2}
                sx={{ textTransform: "capitalize" }}
              >
                {username}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.78rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mb: 0.8,
                }}
              >
                {email}
              </Typography>
              <Chip
                label={roleConfig.label.replace("Role: ", "").replace("Status: ", "")}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  color: "#F8FAFC",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* Content Body */}
        <Box p={2}>
          {/* Status Alert Box */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: "14px",
              bgcolor: roleConfig.bgColor,
              border: `1px solid ${roleConfig.borderColor}`,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <CheckCircle2 size={18} color={roleConfig.color} />
            <Box>
              <Typography variant="caption" fontWeight={700} color={roleConfig.color} display="block">
                Account Status Active
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Authenticated via IntraSphere Single Sign-On
              </Typography>
            </Box>
          </Paper>

          {/* Quick Links List */}
          <Stack spacing={0.5} mb={2}>

            <Button
              fullWidth
              variant="text"
              startIcon={<User size={16} color="#64748B" />}
              onClick={() => {
                handleCloseMenu();
                navigate("/profile");
              }}
              sx={{
                justifyContent: "flex-start",
                borderRadius: "10px",
                py: 0.8,
                px: 1.5,
                color: "#334155",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              Account Profile
            </Button>

            <Button
              fullWidth
              variant="text"
              startIcon={<Building size={16} color="#64748B" />}
              sx={{
                justifyContent: "flex-start",
                borderRadius: "10px",
                py: 0.8,
                px: 1.5,
                color: "#334155",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              Workspace Permissions
            </Button>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Full Logout Button */}
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => {
              handleCloseMenu();
              onLogout();
            }}
            startIcon={<LogOut size={16} />}
            sx={{
              borderRadius: "12px",
              py: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                boxShadow: "0 6px 18px rgba(220, 38, 38, 0.35)",
              },
            }}
          >
            Log Out Account
          </Button>
        </Box>
      </Popover>
    </>
  );
}
