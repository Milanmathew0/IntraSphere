import React from "react";
import { Box, Typography, Stack, Paper } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";

export default function WelcomeBanner({ user }) {
  const currentHour = new Date().getHours();
  let greeting = "Good Evening,";
  if (currentHour < 12) {
    greeting = "Good Morning,";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon,";
  }

  const employeeName = user?.username || user?.first_name || "Milan Mathew";

  const dateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: 180,
        borderRadius: "20px",
        background: "linear-gradient(90deg, #EBF3FA 0%, #E2EEF9 45%, rgba(226, 238, 249, 0.4) 70%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop') center right/cover",
        p: { xs: 2.5, md: 3.5 },
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
        border: "1px solid #E2E8F0",
      }}
    >
      <Box sx={{ maxW: 480 }}>
        {/* Greeting & Name */}
        <Typography
          variant="h5"
          fontWeight={500}
          color="#475569"
          sx={{ fontSize: "1.25rem", lineHeight: 1.1 }}
        >
          {greeting}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color="#0F172A"
          sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" }, lineHeight: 1.25, mt: 0.2 }}
        >
          {employeeName} 👋
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          color="#64748B"
          fontWeight={500}
          sx={{ mt: 0.5, fontSize: "0.9rem" }}
        >
          Let's make today productive!
        </Typography>

        {/* Italic Quote */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            color: "#1E3A8A",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "0.82rem",
          }}
        >
          “A well-organized workplace leads to a focused mind.”
        </Typography>
      </Box>

      {/* Floating Bottom-Right Date Card */}
      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 20,
          px: 2,
          py: 1,
          borderRadius: "12px",
          bgcolor: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1.2,
          border: "1px solid #E2E8F0",
        }}
      >
        <CalendarToday sx={{ fontSize: 18, color: "#0F172A" }} />
        <Typography variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.78rem" }}>
          {dateFormatted}
        </Typography>
      </Paper>
    </Paper>
  );
}
