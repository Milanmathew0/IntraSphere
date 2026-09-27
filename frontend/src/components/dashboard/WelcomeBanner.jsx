import React from "react";
import { Box, Typography, Stack, Paper } from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";

export default function WelcomeBanner({ user }) {
  const currentHour = new Date().getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
  }

  const employeeName = user?.username || user?.first_name || "Milan Mathew";

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "Long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minHeight: 165,
        borderRadius: "20px",
        background: `linear-gradient(90deg, rgba(235, 243, 255, 0.95) 0%, rgba(244, 247, 252, 0.8) 50%, rgba(255, 255, 255, 0.4) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
        p: { xs: 2.5, md: 3.2 },
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(10, 22, 40, 0.03)",
      }}
    >
      <Box sx={{ maxWidth: 520 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color="#0A1628"
          sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, lineHeight: 1.2 }}
        >
          {greeting},
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color="#0A1628"
          sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, lineHeight: 1.15 }}
        >
          {employeeName} 👋
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#64748B",
            mt: 0.6,
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Let's make today productive!
        </Typography>

        {/* Quote Container matching reference */}
        <Box
          sx={{
            mt: 1.8,
            px: 1.5,
            py: 0.8,
            borderRadius: "8px",
            bgcolor: "rgba(37, 99, 235, 0.06)",
            borderLeft: "3px solid #2563EB",
            display: "inline-block",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#1E3A8A",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "0.78rem",
            }}
          >
            “A well-organized workplace leads to a focused mind.”
          </Typography>
        </Box>
      </Box>

      {/* Floating Date Card matching bottom-right of reference */}
      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 20,
          px: 1.8,
          py: 1,
          borderRadius: "14px",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            p: 0.8,
            borderRadius: "8px",
            bgcolor: "#F1F5F9",
            color: "#0A1628",
            display: "flex",
          }}
        >
          <CalendarMonth sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="caption" color="#64748B" display="block" fontWeight={600} sx={{ lineHeight: 1 }}>
            {dayName}
          </Typography>
          <Typography variant="subtitle2" fontWeight={800} color="#0A1628" sx={{ fontSize: "0.82rem" }}>
            {dateStr}
          </Typography>
        </Box>
      </Paper>
    </Paper>
  );
}
