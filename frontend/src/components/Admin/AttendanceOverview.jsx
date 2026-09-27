import React from "react";
import { Paper, Box, Typography, Button, Stack, Grid, Skeleton } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function AttendanceOverview({ data, loading, onNavigateToAttendance }) {
  const att = data?.attendance || {};
  const trend = att.trend_last_7_days || [];

  const maxVal = Math.max(...trend.map((t) => t.present), 1);

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
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#E0F7FA",
              color: "#C2410C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EventAvailableIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Today's Attendance Overview
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        ) : (
          <>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#E8F5E9", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Present
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#2E7D32">
                    {att.present_today ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#FFEBEE", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Absent
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#D32F2F">
                    {att.absent_today ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#FFF7ED", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Checked In
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#F97316">
                    {att.checked_in ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#F3E5F5", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Checked Out
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#7B1FA2">
                    {att.checked_out ?? 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* 7-Day Trend Chart */}
            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1.5}>
              Last 7 Days Attendance Trend
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 100, pt: 2, pb: 1, px: 1 }}>
              {trend.map((dayItem, idx) => {
                const heightPct = Math.round((dayItem.present / maxVal) * 100);
                return (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} color="#F97316" sx={{ fontSize: "0.7rem", mb: 0.5 }}>
                      {dayItem.present}
                    </Typography>
                    <Box
                      sx={{
                        width: "80%",
                        height: `${Math.max(heightPct, 6)}%`,
                        bgcolor: "#F97316",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, fontSize: "0.7rem", fontWeight: 600 }}>
                      {dayItem.day}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={onNavigateToAttendance}
          sx={{
            borderColor: "#F97316",
            color: "#F97316",
            "&:hover": { bgcolor: "#FFF7ED" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.2,
          }}
        >
          View Attendance
        </Button>
      </Box>
    </Paper>
  );
}
