import React from "react";
import { Box, Paper, Typography, Button, Stack, Chip } from "@mui/material";
import { AutoAwesome as SparklesIcon, ArrowForward, Verified } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { SmartOfficeIllustration } from "../SmartOfficeIllustration";

export default function SmartOfficeSideCard() {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        background: "linear-gradient(145deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
        color: "#FFFFFF",
        p: 3,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Background Accent Radial Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(25, 118, 210, 0.35) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header Tag */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Chip
          icon={<Verified sx={{ fontSize: "14px !important", color: "#60A5FA" }} />}
          label="Smart Workspace AI"
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            color: "#93C5FD",
            fontWeight: 700,
            fontSize: "0.72rem",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}
        />
        <Chip
          label="Pro Portal"
          size="small"
          sx={{
            bgcolor: "rgba(34, 197, 94, 0.15)",
            color: "#4ADE80",
            fontWeight: 700,
            fontSize: "0.68rem",
            borderRadius: "6px",
          }}
        />
      </Stack>

      {/* Title */}
      <Typography variant="h6" fontWeight={800} color="#FFFFFF" sx={{ lineHeight: 1.2, mb: 0.5 }}>
        IntraSphere Hub
      </Typography>
      <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 2 }}>
        Automated Desk Booking & Meeting Room Management
      </Typography>

      {/* Interactive Vector Smart Office Illustration */}
      <Box
        sx={{
          my: 1,
          display: "flex",
          justifyContent: "center",
          transform: "scale(0.95)",
          transformOrigin: "center",
        }}
      >
        <SmartOfficeIllustration />
      </Box>

      {/* Feature Bullet Highlights */}
      <Stack spacing={1} sx={{ my: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#60A5FA" }} />
          <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 500 }}>
            Real-Time War Room & Call Pod Availability
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ADE80" }} />
          <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 500 }}>
            Automated Daily Punch Logs & Attendance Tracking
          </Typography>
        </Box>
      </Stack>

      {/* Action Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/workspaces")}
        endIcon={<ArrowForward sx={{ fontSize: "16px !important" }} />}
        sx={{
          py: 1.2,
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "0.85rem",
          bgcolor: "#1976D2",
          color: "#FFFFFF",
          textTransform: "none",
          boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
          "&:hover": {
            bgcolor: "#1565C0",
            boxShadow: "0 6px 20px rgba(25, 118, 210, 0.6)",
          },
        }}
      >
        Quick Reserve Desk
      </Button>
    </Paper>
  );
}
