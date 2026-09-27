import React from "react";
import { Box, Typography, Stack, Button, Chip } from "@mui/material";
import { AutoAwesome as SparklesIcon, CalendarMonth, AccessTime } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function WelcomeBanner({ user, onQuickCheckIn }) {
  const navigate = useNavigate();

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  let greeting = "Good Day";
  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  const employeeName = user?.username || user?.email?.split("@")[0] || "Employee";

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 170,
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #1976D2 100%)",
        color: "#FFFFFF",
        p: { xs: 3, md: 4 },
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Decorative Background Lighting Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(25, 118, 210, 0.4) 0%, rgba(25, 118, 210, 0) 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -60,
          left: "30%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          position: "relative",
          zIndex: 1,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
        }}
      >
        <Box sx={{ maxWidth: 650 }}>
          {/* Top Pill with Date */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <Chip
              icon={<CalendarMonth sx={{ fontSize: "14px !important", color: "#60A5FA" }} />}
              label={todayFormatted}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.12)",
                color: "#E2E8F0",
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: "8px",
                backdropFilter: "blur(4px)",
              }}
            />
            <Chip
              icon={<SparklesIcon sx={{ fontSize: "14px !important", color: "#FBBF24" }} />}
              label="IntraSphere SaaS Portal"
              size="small"
              sx={{
                bgcolor: "rgba(251, 191, 36, 0.15)",
                color: "#FCD34D",
                fontWeight: 700,
                fontSize: "0.72rem",
                borderRadius: "8px",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          </Stack>

          {/* Dynamic Greeting & Name */}
          <Typography
            variant="h4"
            fontWeight={800}
            color="#FFFFFF"
            sx={{
              fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2.1rem" },
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            {greeting}, {employeeName}! 👋
          </Typography>

          {/* Subtitle & Quote */}
          <Typography
            variant="body1"
            sx={{
              color: "#94A3B8",
              mt: 0.75,
              fontWeight: 500,
              fontSize: { xs: "0.88rem", sm: "0.95rem" },
            }}
          >
            Let's make today productive!{" "}
            <Typography
              component="span"
              sx={{
                color: "#CBD5E1",
                fontStyle: "italic",
                display: { xs: "none", sm: "inline" },
              }}
            >
              — "A well-organized workplace leads to a focused mind."
            </Typography>
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => navigate("/workspaces")}
            startIcon={<SparklesIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: "#1976D2",
              color: "#FFFFFF",
              fontWeight: 700,
              px: 2.5,
              py: 1.1,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.88rem",
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
              "&:hover": {
                bgcolor: "#1565C0",
                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.6)",
              },
            }}
          >
            Reserve Workspace
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
