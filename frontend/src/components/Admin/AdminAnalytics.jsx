import React from "react";
import { Paper, Box, Typography, Grid, LinearProgress, Stack, Skeleton } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

export default function AdminAnalytics({ data, loading }) {
  const depts = data?.organization?.employees_by_department || [];
  const roomUtil = data?.meeting_rooms?.room_utilization || [];
  const leaveDist = data?.leave?.distribution || [];
  const maxDept = Math.max(...depts.map((d) => d.count), 1);
  const maxRoom = Math.max(...roomUtil.map((r) => r.booking_count), 1);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        mb: 4,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#E3F2FD",
            color: "#1976D2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InsightsIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Organization & System Analytics
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time analytics computed directly from IntraSphere database collections.
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
      ) : (
        <Grid container spacing={4}>
          {/* Department Breakdown */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={2}>
              Employees by Department
            </Typography>
            {depts.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No department data available.
              </Typography>
            ) : (
              <Stack spacing={1.8}>
                {depts.map((d, idx) => {
                  const pct = Math.round((d.count / maxDept) * 100);
                  return (
                    <Box key={idx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">
                          {d.department}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#1976D2">
                          {d.count} employees
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#1976D2" } }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Grid>

          {/* Meeting Room Utilization */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={2}>
              Meeting Room Utilization
            </Typography>
            {roomUtil.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No room utilization records.
              </Typography>
            ) : (
              <Stack spacing={1.8}>
                {roomUtil.map((r, idx) => {
                  const pct = Math.round((r.booking_count / maxRoom) * 100);
                  return (
                    <Box key={idx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">
                          {r.room_name}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#7B1FA2">
                          {r.booking_count} bookings
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#7B1FA2" } }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Grid>

          {/* Leave Distribution */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={2}>
              Leave Request Distribution
            </Typography>
            {leaveDist.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No leave records.
              </Typography>
            ) : (
              <Stack spacing={1.8}>
                {leaveDist.map((lt, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} color="#1E293B">
                      {lt.name}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="#0288D1">
                      {lt.count} requests
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
