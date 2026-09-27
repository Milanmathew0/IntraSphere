import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Campaign, CalendarToday, ArrowForward } from "@mui/icons-material";
import api from "../../api/axios";

export default function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    // Default fallback announcements as per spec
    const sampleAnnouncements = [
      {
        id: 1,
        title: "Office Holiday Notice - Gandhi Jayanti",
        description: "The office will remain closed on October 2nd. Mandatory facilities maintenance will be performed.",
        date: "Sep 28, 2026",
        category: "Notice",
        color: { bg: "#FEF3C7", text: "#B45309" },
      },
      {
        id: 2,
        title: "IT Maintenance & Server Upgrade",
        description: "Network maintenance scheduled for Saturday 10:00 PM - 02:00 AM. Intermittent API latency may occur.",
        date: "Sep 26, 2026",
        category: "IT Alert",
        color: { bg: "#E0F2FE", text: "#0369A1" },
      },
      {
        id: 3,
        title: "Team Building Event & Hackathon",
        description: "Join us for IntraSphere Q4 Innovation Hackathon on Friday at the main auditorium.",
        date: "Sep 24, 2026",
        category: "Event",
        color: { bg: "#DCFCE7", text: "#15803D" },
      },
      {
        id: 4,
        title: "New Workspace Desk Booking Guidelines",
        description: "Check out the updated hot-desking policy regarding maximum consecutive desk reservation hours.",
        date: "Sep 20, 2026",
        category: "Policy",
        color: { bg: "#F3E8FF", text: "#7E22CE" },
      },
    ];

    setAnnouncements(sampleAnnouncements);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Campaign sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            Recent Announcements
          </Typography>
        </Box>
      </Stack>

      {/* List */}
      <Stack spacing={1.8}>
        {announcements.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            onClick={() => setSelectedNotice(item)}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#FFFFFF",
                borderColor: "#10B981",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.1)",
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.8}>
              <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.88rem" }}>
                {item.title}
              </Typography>
              <Chip
                label={item.category}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: item.color.bg,
                  color: item.color.text,
                  borderRadius: "5px",
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            </Stack>

            <Typography
              variant="caption"
              color="#64748B"
              display="-webkit-box"
              sx={{
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {item.description}
            </Typography>

            <Typography
              variant="caption"
              color="#94A3B8"
              display="flex"
              alignItems="center"
              gap={0.5}
              mt={1}
              fontWeight={500}
            >
              <CalendarToday sx={{ fontSize: 12 }} /> {item.date}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Notice Detail Dialog */}
      <Dialog
        open={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        PaperProps={{ sx: { borderRadius: "16px", p: 1, minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#0F172A" }}>
          {selectedNotice?.title}
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotice && (
            <Stack spacing={1.5}>
              <Chip
                label={selectedNotice.category}
                size="small"
                sx={{
                  width: "fit-content",
                  fontWeight: 700,
                  bgcolor: selectedNotice.color.bg,
                  color: selectedNotice.color.text,
                }}
              />
              <Typography variant="body2" color="#475569" lineHeight={1.6}>
                {selectedNotice.description}
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Posted on {selectedNotice.date}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNotice(null)} sx={{ fontWeight: 700, color: "#475569" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
