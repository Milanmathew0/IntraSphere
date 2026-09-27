import React, { useState } from "react";
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
  Divider,
} from "@mui/material";
import {
  AccessTime,
  Groups,
  Desk,
  LocationOn,
  ChevronRight,
  InfoOutlined,
  CalendarToday,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function TodaySchedule({ scheduleItems = [] }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
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
              bgcolor: "#F0F7FF",
              color: "#F97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarToday sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            Today's Schedule
          </Typography>
        </Box>
        <Chip
          label={`${scheduleItems.length} Events`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.72rem",
            bgcolor: "#F1F5F9",
            color: "#475569",
            borderRadius: "6px",
          }}
        />
      </Stack>

      {/* Schedule Items List */}
      {scheduleItems.length === 0 ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: "center",
            borderRadius: "14px",
            bgcolor: "#F8FAFC",
            border: "1px dashed #CBD5E1",
            my: "auto",
          }}
        >
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            No scheduled meetings or desk reservations for today.
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/meeting-rooms")}
            sx={{
              mt: 1.5,
              fontWeight: 700,
              color: "#F97316",
              textTransform: "none",
              fontSize: "0.8rem",
            }}
          >
            Book a Meeting Room Now →
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.8} sx={{ flexGrow: 1 }}>
          {scheduleItems.map((item, idx) => (
            <Paper
              key={idx}
              elevation={0}
              onClick={() => setSelectedItem(item)}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FFFFFF",
                  borderColor: "#F97316",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.1)",
                  transform: "translateX(3px)",
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ display: "flex", gap: 1.5, overflow: "hidden" }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "10px",
                      bgcolor: item.type === "workspace" ? "#F3E8FF" : "#E0F2FE",
                      color: item.type === "workspace" ? "#7E22CE" : "#0369A1",
                      height: "fit-content",
                    }}
                  >
                    {item.type === "workspace" ? <Desk fontSize="small" /> : <Groups fontSize="small" />}
                  </Box>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="#0F172A"
                      noWrap
                      sx={{ fontSize: "0.88rem" }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#64748B"
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                      mt={0.3}
                    >
                      <LocationOn sx={{ fontSize: 13, color: "#94A3B8" }} /> {item.location}
                    </Typography>
                  </Box>
                </Box>

                <Stack alignItems="flex-end" spacing={0.5}>
                  <Chip
                    icon={<AccessTime sx={{ fontSize: "12px !important", color: "#F97316" }} />}
                    label={item.time}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                  />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Booking Details Modal */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        PaperProps={{ sx: { borderRadius: "16px", p: 1, minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#0F172A" }}>
          Schedule Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={800} color="#F97316">
                {selectedItem.title}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Time:</strong> {selectedItem.time}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Location:</strong> {selectedItem.location}
              </Typography>
              <Typography variant="body2" color="#475569">
                <strong>Type:</strong> {selectedItem.type === "workspace" ? "Workspace Desk Reservation" : "Meeting Room Booking"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)} sx={{ fontWeight: 700, color: "#475569" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
