import React from "react";
import { Box, Paper, Typography, Stack, Button } from "@mui/material";
import { Campaign, Settings, Groups, Description } from "@mui/icons-material";

export default function RecentAnnouncements() {
  const announcements = [
    {
      id: 1,
      title: "Office Holiday Notice",
      date: "22 Sep 2026",
      snippet: "The office will remain closed on 2nd October 20...",
      icon: <Campaign sx={{ fontSize: 18, color: "#2563EB" }} />,
      iconBg: "#E0F2FE",
    },
    {
      id: 2,
      title: "IT Maintenance",
      date: "20 Sep 2026",
      snippet: "Scheduled system maintenance on 23rd Septe...",
      icon: <Settings sx={{ fontSize: 18, color: "#EA580C" }} />,
      iconBg: "#FFEDD5",
    },
    {
      id: 3,
      title: "Team Building Event",
      date: "18 Sep 2026",
      snippet: "Join us for the annual team building event on 28...",
      icon: <Groups sx={{ fontSize: 18, color: "#7E22CE" }} />,
      iconBg: "#F3E8FF",
    },
    {
      id: 4,
      title: "New Workspace Guidelines",
      date: "15 Sep 2026",
      snippet: "Updated workspace usage guidelines are now a...",
      icon: <Description sx={{ fontSize: 18, color: "#D97706" }} />,
      iconBg: "#FEF3C7",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "18px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
          Recent Announcements
        </Typography>
        <Button
          size="small"
          sx={{
            color: "#2563EB",
            fontWeight: 700,
            fontSize: "0.78rem",
            textTransform: "none",
            p: 0,
            minWidth: 0,
          }}
        >
          View All
        </Button>
      </Box>

      {/* List */}
      <Stack spacing={1.6}>
        {announcements.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 1.2,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "#FFFFFF", borderColor: "#CBD5E1" },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: item.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: 0.2,
              }}
            >
              {item.icon}
            </Box>

            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.83rem" }} noWrap>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.7rem", flexShrink: 0 }}>
                  {item.date}
                </Typography>
              </Box>
              <Typography variant="caption" color="#64748B" sx={{ fontSize: "0.75rem", display: "block", mt: 0.3 }} noWrap>
                {item.snippet}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
