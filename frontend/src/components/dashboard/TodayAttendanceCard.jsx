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
  let statusBadgeColor = { bg: "#F4F4F5", text: "#09090B", border: "#E4E4E7" };

  if (hasCheckedIn && !hasCheckedOut) {
    statusState = "Checked In";
    statusBadgeColor = { bg: "#18181B", text: "#FFFFFF", border: "#27272A" };
  } else if (hasCheckedIn && hasCheckedOut) {
    statusState = "Attendance Completed";
    statusBadgeColor = { bg: "#F4F4F5", text: "#09090B", border: "#E4E4E7" };
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    try {
      let str = String(timeStr).trim();
      // If ISO format without Z or timezone offset, append Z to force UTC parsing
      if (str.includes("T") && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
        str += "Z";
      } else if (!str.includes("T") && str.includes(":") && !str.includes("Z")) {
        // If time-only string like "16:12:00", combine with today's date in UTC
        const todayUtc = new Date().toISOString().split("T")[0];
        str = `${todayUtc}T${str}Z`;
      }

      const d = new Date(str);
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
        border: "1px solid #E4E4E7",
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
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#09090B" lineHeight={1.2}>
                Today's Attendance
              </Typography>
              <Typography variant="caption" color="#71717A" display="flex" alignItems="center" gap={0.5} mt={0.3}>
                <Calendar size={12} /> {todayFormatted}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Attendance State">
              <Button
                size="small"
                onClick={fetchTodayAttendance}
                sx={{ minWidth: 32, p: 0.8, color: "#09090B", borderRadius: "8px" }}
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
                border: `1px solid ${statusBadgeColor.border}`,
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
                bgcolor: "#F4F4F5",
                border: "1px solid #E4E4E7",
                mb: 3,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="#09090B">
                {!hasCheckedIn && "⚠️ You haven't checked in today."}
                {hasCheckedIn && !hasCheckedOut && "🟢 You are currently checked in."}
                {hasCheckedIn && hasCheckedOut && "🎉 Attendance Completed for today!"}
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="#71717A" display="block" mt={0.5}>
                  Last updated: {lastUpdated}
                </Typography>
              )}
            </Paper>

            {/* Attendance Details Grid */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#FAFAFA",
                borderRadius: "12px",
                border: "1px solid #E4E4E7",
                mb: 3,
              }}
            >
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={4}>
                  <Typography variant="caption" color="#71717A" fontWeight={600} display="block">
                    CHECK IN
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#09090B" mt={0.5}>
                    {todayRecord?.check_in ? formatTime(todayRecord.check_in) : "--:--"}
                  </Typography>
                </Grid>

                <Grid item xs={4} sx={{ borderLeft: "1px solid #E4E4E7", borderRight: "1px solid #E4E4E7" }}>
                  <Typography variant="caption" color="#71717A" fontWeight={600} display="block">
                    CHECK OUT
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#09090B" mt={0.5}>
                    {todayRecord?.check_out ? formatTime(todayRecord.check_out) : "--:--"}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="caption" color="#71717A" fontWeight={600} display="block">
                    WORKING HOURS
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#09090B" mt={0.5}>
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
                    bgcolor: "#09090B",
                    color: "#FFFFFF",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#27272A", boxShadow: "none" },
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
                    bgcolor: "#27272A",
                    color: "#FFFFFF",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#3F3F46", boxShadow: "none" },
                    textTransform: "none",
                  }}
                >
                  {actionLoading ? "Processing Check-Out..." : "Check Out Now"}
                </Button>
              )}

              {hasCheckedIn && hasCheckedOut && (
                <Chip
                  icon={<CheckCircle2 size={16} style={{ color: "#09090B" }} />}
                  label="Today's Shift Completed"
                  sx={{
                    width: "100%",
                    py: 2.2,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    bgcolor: "#F4F4F5",
                    color: "#09090B",
                    border: "1px solid #E4E4E7",
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
