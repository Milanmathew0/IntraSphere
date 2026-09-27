import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Stack,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import BuildIcon from "@mui/icons-material/Build";

import api from "../../api/axios";

export default function FacilityAnalytics() {
  const [period, setPeriod] = useState("month");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/facility/analytics", {
        params: { period },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const roomsData = analytics?.meeting_rooms || {};
  const deskData = analytics?.workspaces || {};
  const maintData = analytics?.maintenance || {};

  return (
    <Box>
      {/* Top Controls Bar */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: "#ECFDF5",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InsightsIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Facility Utilization & Maintenance Analytics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Real-time MongoDB aggregation metrics computed for rooms, desks, and maintenance activities.
              </Typography>
            </Box>
          </Stack>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Analytics Period</InputLabel>
            <Select value={period} label="Analytics Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress sx={{ color: "#10B981" }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Meeting Room Analytics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <MeetingRoomIcon sx={{ color: "#10B981" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Meeting Room Utilization
                </Typography>
              </Stack>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Box p={2} borderRadius={2} bgcolor="#F8FAFC" border="1px solid #F1F5F9">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Bookings</Typography>
                    <Typography variant="h5" fontWeight={800} color="#10B981">{roomsData.total_bookings ?? 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box p={2} borderRadius={2} bgcolor="#F8FAFC" border="1px solid #F1F5F9">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Avg Utilization Rate</Typography>
                    <Typography variant="h5" fontWeight={800} color="#2E7D32">{roomsData.average_utilization_percent ?? 0}%</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1.5}>
                Most Frequently Booked Rooms
              </Typography>

              <Stack spacing={2}>
                {(roomsData.most_booked || []).map((rm, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={600} color="#1E293B">
                        {rm.room_name}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#10B981">
                        {rm.booking_count} bookings
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min((rm.booking_count / (roomsData.total_bookings || 1)) * 100, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: "#ECFDF5", "& .MuiLinearProgress-bar": { bgcolor: "#10B981" } }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Workspace Analytics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <DesktopWindowsIcon sx={{ color: "#047857" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Workspace & Desk Utilization
                </Typography>
              </Stack>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Box p={2} borderRadius={2} bgcolor="#F8FAFC" border="1px solid #F1F5F9">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Reservations</Typography>
                    <Typography variant="h5" fontWeight={800} color="#047857">{deskData.total_reservations ?? 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box p={2} borderRadius={2} bgcolor="#F8FAFC" border="1px solid #F1F5F9">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Avg Utilization Rate</Typography>
                    <Typography variant="h5" fontWeight={800} color="#00796B">{deskData.average_utilization_percent ?? 0}%</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1.5}>
                Most Frequently Reserved Desks
              </Typography>

              <Stack spacing={2}>
                {(deskData.most_reserved || []).map((dk, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={600} color="#1E293B">
                        Desk {dk.desk_code}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#047857">
                        {dk.reservation_count} reservations
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min((dk.reservation_count / (deskData.total_reservations || 1)) * 100, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: "#ECFDF5", "& .MuiLinearProgress-bar": { bgcolor: "#047857" } }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Maintenance Metrics Overview */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <BuildIcon sx={{ color: "#ED6C02" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Maintenance Performance Metrics
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Box p={2.5} borderRadius={2.5} bgcolor="#FFF3E0" border="1px solid #FFE0B2">
                    <Typography variant="caption" color="#E65100" fontWeight={700}>Active Open Issues</Typography>
                    <Typography variant="h4" fontWeight={800} color="#ED6C02">{maintData.open_issues ?? 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box p={2.5} borderRadius={2.5} bgcolor="#E8F5E9" border="1px solid #C8E6C9">
                    <Typography variant="caption" color="#1B5E20" fontWeight={700}>Completed Issues</Typography>
                    <Typography variant="h4" fontWeight={800} color="#2E7D32">{maintData.completed_issues ?? 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box p={2.5} borderRadius={2.5} bgcolor="#FFEBEE" border="1px solid #FFCDD2">
                    <Typography variant="caption" color="#B71C1C" fontWeight={700}>Critical Priority Issues</Typography>
                    <Typography variant="h4" fontWeight={800} color="#D32F2F">{maintData.critical_priority_issues ?? 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box p={2.5} borderRadius={2.5} bgcolor="#ECFDF5" border="1px solid #BBDEFB">
                    <Typography variant="caption" color="#0D47A1" fontWeight={700}>Avg Resolution Time</Typography>
                    <Typography variant="h4" fontWeight={800} color="#10B981">{maintData.avg_resolution_hours ?? 4.5} hrs</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
