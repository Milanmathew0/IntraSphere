import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AlarmOffIcon from "@mui/icons-material/AlarmOff";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../../api/axios";

export default function EmployeePerformanceOverview() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [department, setDepartment] = useState("All");
  const [data, setData] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange, 10) || 30;
      const endDate = new Date().toISOString().split("T")[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - days);
      const startDate = startDateObj.toISOString().split("T")[0];

      const res = await api.get("/api/v1/attendance/performance-overview", {
        params: {
          start_date: startDate,
          end_date: endDate,
          department: department === "All" ? "" : department,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch performance overview", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [timeRange, department]);

  const summary = data?.summary || {};
  const trend = data?.trend || [];
  const deptBreakdown = data?.department_breakdown || [];

  const maxVal = Math.max(...trend.map((t) => t.present), 1);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header & Controls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EqualizerIcon sx={{ color: "#F97316" }} /> Employee Attendance & Punctuality Trends
          </Typography>
          <Typography variant="body2" color="#64748B">
            Analytics & management metrics evaluating punctuality scores and work trends across teams.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <MenuItem value="All">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                ATTENDANCE RATE
              </Typography>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleOutlinedIcon fontSize="small" />
              </Box>
            </Stack>
            {loading ? (
              <Skeleton width="60%" height={32} />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  {summary.attendance_rate ?? 0}%
                </Typography>
                <Typography variant="caption" color="#10B981" fontWeight={600}>
                  {summary.total_present || 0} Total Check-ins
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                PUNCTUALITY RATE
              </Typography>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#EFF6FF", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUpIcon fontSize="small" />
              </Box>
            </Stack>
            {loading ? (
              <Skeleton width="60%" height={32} />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  {summary.punctuality_rate ?? 0}%
                </Typography>
                <Typography variant="caption" color="#3B82F6" fontWeight={600}>
                  {summary.total_on_time || 0} On-time arrivals
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                LATE ARRIVALS
              </Typography>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlarmOffIcon fontSize="small" />
              </Box>
            </Stack>
            {loading ? (
              <Skeleton width="60%" height={32} />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#EF4444">
                  {summary.total_late ?? 0}
                </Typography>
                <Typography variant="caption" color="#64748B" fontWeight={500}>
                  After 09:15 AM cut-off
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                AVG WORKING HOURS
              </Typography>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#FFF7ED", color: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AccessTimeIcon fontSize="small" />
              </Box>
            </Stack>
            {loading ? (
              <Skeleton width="60%" height={32} />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  {summary.avg_working_hours ?? 0} <Typography component="span" variant="subtitle2" color="#64748B">hrs/day</Typography>
                </Typography>
                <Typography variant="caption" color="#F97316" fontWeight={600}>
                  Productive hours logged
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Main Grid: Trend Bar Visualization & Department Punctuality */}
      <Grid container spacing={3}>
        {/* Trend Bar Visualizer */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
              Attendance & Punctuality Trend
            </Typography>
            <Typography variant="caption" color="#64748B" mb={3} display="block">
              Daily presence distribution split by On-Time (Green) and Late (Red) check-ins.
            </Typography>

            {loading ? (
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            ) : trend.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body2" color="#94A3B8">
                  No trend data available for selected period.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: { xs: 0.5, sm: 1 }, height: 180, pt: 3, pb: 1, overflowX: "auto" }}>
                {trend.map((dayItem, idx) => {
                  const total = dayItem.present || 0;
                  const late = dayItem.late || 0;
                  const onTime = dayItem.on_time || (total - late);
                  const barHeightPct = maxVal > 0 ? (total / maxVal) * 100 : 0;
                  const onTimePct = total > 0 ? (onTime / total) * 100 : 100;
                  const latePct = total > 0 ? (late / total) * 100 : 0;

                  return (
                    <Tooltip
                      key={idx}
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} display="block">
                            {dayItem.date}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Total Present: {total}
                          </Typography>
                          <Typography variant="caption" color="#4ADE80" display="block">
                            On-Time: {onTime}
                          </Typography>
                          <Typography variant="caption" color="#F87171" display="block">
                            Late: {late}
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 18,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: 24,
                            height: `${Math.max(barHeightPct, 6)}%`,
                            bgcolor: "#E2E8F0",
                            borderRadius: "6px 6px 0 0",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            transition: "all 0.3s ease",
                            "&:hover": { opacity: 0.85, transform: "scaleY(1.04)" },
                          }}
                        >
                          <Box sx={{ height: `${onTimePct}%`, bgcolor: "#10B981" }} />
                          <Box sx={{ height: `${latePct}%`, bgcolor: "#EF4444" }} />
                        </Box>
                        <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.65rem", mt: 1, transform: "rotate(-45deg)", transformOrigin: "top left" }}>
                          {dayItem.date.slice(5)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Department Punctuality Progress */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
              Department Punctuality
            </Typography>
            <Typography variant="caption" color="#64748B" mb={2.5} display="block">
              Punctuality performance across organizational teams.
            </Typography>

            {loading ? (
              <Stack spacing={2}>
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : deptBreakdown.length === 0 ? (
              <Typography variant="body2" color="#94A3B8">
                No department breakdown available.
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                {deptBreakdown.map((dept, i) => (
                  <Box key={i}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        {dept.department}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color={dept.punctuality_rate >= 80 ? "#10B981" : "#F97316"}>
                        {dept.punctuality_rate}% Punctual
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={dept.punctuality_rate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#F1F5F9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: dept.punctuality_rate >= 85 ? "#10B981" : dept.punctuality_rate >= 70 ? "#F97316" : "#EF4444",
                        },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="#94A3B8">
                        {dept.present_count} present
                      </Typography>
                      <Typography variant="caption" color="#EF4444" fontWeight={600}>
                        {dept.late_count} late
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
