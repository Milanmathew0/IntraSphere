import React from "react";
import { Paper, Box, Typography, Button, Stack, Chip, List, ListItem, ListItemText, Grid, Skeleton } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

export default function MeetingRoomOverview({ data, loading }) {
  const navigate = useNavigate();
  const mr = data?.meeting_rooms || {};
  const todayBookings = mr.today_bookings_list || [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#F3E5F5",
              color: "#7B1FA2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MeetingRoomIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Meeting Room Booking Overview
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        ) : (
          <>
            <Grid container spacing={1.2} sx={{ mb: 2 }}>
              <Grid item xs={2.4}>
                <Paper elevation={0} sx={{ p: 1, textAlign: "center", bgcolor: "#F1F5F9", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {mr.total ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={2.4}>
                <Paper elevation={0} sx={{ p: 1, textAlign: "center", bgcolor: "#E8F5E9", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Available
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#2E7D32">
                    {mr.available ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={2.4}>
                <Paper elevation={0} sx={{ p: 1, textAlign: "center", bgcolor: "#FFF3E0", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Occupied
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#ED6C02">
                    {mr.occupied ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={2.4}>
                <Paper elevation={0} sx={{ p: 1, textAlign: "center", bgcolor: "#FFEBEE", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Maint.
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#D32F2F">
                    {mr.maintenance ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={2.4}>
                <Paper elevation={0} sx={{ p: 1, textAlign: "center", bgcolor: "#ECFDF5", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Bookings
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#10B981">
                    {mr.bookings_today ?? 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1}>
              Today's Scheduled Bookings
            </Typography>

            {todayBookings.length === 0 ? (
              <Box sx={{ py: 2, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No bookings scheduled for today yet.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {todayBookings.map((b) => (
                  <ListItem
                    key={b.id}
                    sx={{
                      px: 2,
                      py: 1,
                      mb: 1,
                      bgcolor: "#F8FAFC",
                      borderRadius: 2,
                      border: "1px solid #F1F5F9",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {b.room_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {b.time_range} · {b.title}
                        </Typography>
                      }
                    />
                    <Chip label={b.status} size="small" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }} />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/meeting-rooms")}
            sx={{
              bgcolor: "#10B981",
              "&:hover": { bgcolor: "#059669" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
            }}
          >
            Meeting Rooms
          </Button>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate("/meeting-rooms")}
            sx={{
              borderColor: "#64748B",
              color: "#334155",
              "&:hover": { bgcolor: "#F1F5F9" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            Manage Rooms
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
