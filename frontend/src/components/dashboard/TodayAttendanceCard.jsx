import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Timer,
  RefreshCw,
  MapPin,
} from "lucide-react";
import api from "../../api/axios";

export default function TodayAttendanceCard({ user, onAttendanceChange, showToast }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const employeeCode =
    user?.email ||
    localStorage.getItem("email") ||
    user?.employee_code ||
    localStorage.getItem("employee_code") ||
    user?.username;

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/attendance/today");
      const records = response.data.attendance || [];

      const userEmail = (user?.email || localStorage.getItem("email") || "").toLowerCase();
      const userCode = employeeCode.toLowerCase();
      const userId = user?.id || user?.user_id;

      // Strictly match current logged-in employee's own record
      const myRecord = records.find((rec) => {
        const recEmail = (rec.email || "").toLowerCase();
        const recCode = (rec.employee_code || "").toLowerCase();
        const recEmpId = rec.employee_id;

        return (
          (recEmail && userEmail && recEmail === userEmail) ||
          (recCode && userCode && recCode === userCode) ||
          (recEmpId && userId && recEmpId === userId)
        );
      });

      setTodayRecord(myRecord || null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Failed to fetch today attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await api.post("/api/v1/attendance/check-in", {
        employee_code: employeeCode,
      });

      showToast(response.data.message || "Check-in successful!", "success");
      await fetchTodayAttendance();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const detail = err.response?.data?.detail || "Check-in failed";
      showToast(detail, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/api/v1/attendance/check-out/${employeeCode}`);

      showToast(response.data.message || "Check-out successful!", "success");
      await fetchTodayAttendance();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const detail = err.response?.data?.detail || "Check-out failed";
      showToast(detail, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Determine Attendance State
  const hasCheckedIn = Boolean(todayRecord && todayRecord.check_in);
  const hasCheckedOut = Boolean(todayRecord && todayRecord.check_out);

  let statusState = "Not Checked In";
  let statusBadgeColor = { bg: "#FEF3C7", text: "#D97706" }; // Amber

  if (hasCheckedIn && !hasCheckedOut) {
    statusState = "Checked In";
    statusBadgeColor = { bg: "#E0F2FE", text: "#0284C7" }; // Light Blue
  } else if (hasCheckedIn && hasCheckedOut) {
    statusState = "Attendance Completed";
    statusBadgeColor = { bg: "#DCFCE7", text: "#15803D" }; // Green
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    try {
      const d = new Date(timeStr);
      return isNaN(d.getTime())
        ? timeStr
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 3.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Card Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: "12px",
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A" lineHeight={1.2}>
                Today's Attendance
              </Typography>
              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mt={0.3}>
                <Calendar size={12} /> {todayFormatted}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Attendance State">
              <Button
                size="small"
                onClick={fetchTodayAttendance}
                sx={{ minWidth: 32, p: 0.8, color: "#64748B", borderRadius: "8px" }}
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
              </Button>
            </Tooltip>
            <Chip
              icon={
                hasCheckedOut ? (
                  <CheckCircle2 size={14} style={{ color: statusBadgeColor.text }} />
                ) : (
                  <AlertCircle size={14} style={{ color: statusBadgeColor.text }} />
                )
              }
              label={statusState}
              sx={{
                bgcolor: statusBadgeColor.bg,
                color: statusBadgeColor.text,
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "8px",
                px: 0.5,
              }}
            />
          </Stack>
        </Stack>

        {loading ? (
          <Box py={2}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: "12px", mb: 2 }} />
            <Skeleton variant="rectangular" height={42} sx={{ borderRadius: "10px" }} />
          </Box>
        ) : (
          <>
            {/* Status Banner Message */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: !hasCheckedIn ? "#FFFBEB" : hasCheckedOut ? "#F0FDF4" : "#F0F9FF",
                border: "1px solid",
                borderColor: !hasCheckedIn ? "#FCD34D" : hasCheckedOut ? "#86EFAC" : "#BAE6FD",
                mb: 3,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="#1E293B">
                {!hasCheckedIn && "⚠️ You haven't checked in today."}
                {hasCheckedIn && !hasCheckedOut && "🟢 You are currently checked in."}
                {hasCheckedIn && hasCheckedOut && "🎉 Attendance Completed for today!"}
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Last updated: {lastUpdated}
                </Typography>
              )}
            </Paper>

            {/* Attendance Details Grid */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#F8FAFC",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                mb: 3,
              }}
            >
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    CHECK IN
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mt={0.5}>
                    {todayRecord?.check_in ? formatTime(todayRecord.check_in) : "--:--"}
                  </Typography>
                </Grid>

                <Grid item xs={4} sx={{ borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    CHECK OUT
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mt={0.5}>
                    {todayRecord?.check_out ? formatTime(todayRecord.check_out) : "--:--"}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    WORKING HOURS
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#2563EB" mt={0.5}>
                    {todayRecord?.working_hours ? `${todayRecord.working_hours} hrs` : "--"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Dynamic Action Buttons */}
            <Box mt="auto">
              {!hasCheckedIn && (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={actionLoading}
                  onClick={handleCheckIn}
                  startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : <LogIn size={18} />}
                  sx={{
                    py: 1.3,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    bgcolor: "#16A34A",
                    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                    "&:hover": { bgcolor: "#15803D" },
                    textTransform: "none",
                  }}
                >
                  {actionLoading ? "Processing Check-In..." : "Check In Now"}
                </Button>
              )}

              {hasCheckedIn && !hasCheckedOut && (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={actionLoading}
                  onClick={handleCheckOut}
                  startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : <LogOut size={18} />}
                  sx={{
                    py: 1.3,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    bgcolor: "#DC2626",
                    boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                    "&:hover": { bgcolor: "#B91C1C" },
                    textTransform: "none",
                  }}
                >
                  {actionLoading ? "Processing Check-Out..." : "Check Out Now"}
                </Button>
              )}

              {hasCheckedIn && hasCheckedOut && (
                <Chip
                  icon={<CheckCircle2 size={16} style={{ color: "#15803D" }} />}
                  label="Today's Shift Completed"
                  sx={{
                    width: "100%",
                    py: 2.2,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    bgcolor: "#DCFCE7",
                    color: "#15803D",
                    border: "1px solid #86EFAC",
                  }}
                />
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
