import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { Login, Logout, CheckCircle, Refresh } from "@mui/icons-material";
import api from "../../api/axios";

export default function AttendanceOverview({ user, onAttendanceChange, showToast }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");

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
      const userCode = (employeeCode || "").toLowerCase();
      const userId = user?.id || user?.user_id;

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
    } catch (err) {
      console.error("Attendance fetch error:", err);
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
      if (showToast) showToast(response.data.message || "Check-in successful!", "success");
      await fetchTodayAttendance();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const detail = err.response?.data?.detail || "Check-in failed";
      if (showToast) showToast(detail, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/api/v1/attendance/check-out/${employeeCode}`);
      if (showToast) showToast(response.data.message || "Check-out successful!", "success");
      await fetchTodayAttendance();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const detail = err.response?.data?.detail || "Check-out failed";
      if (showToast) showToast(detail, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const hasCheckedIn = Boolean(todayRecord && todayRecord.check_in);
  const hasCheckedOut = Boolean(todayRecord && todayRecord.check_out);

  // Grouped Bar Data for W1 - W5 matching reference image
  const chartWeeks = [
    { label: "W1", present: 5, halfDay: 1, absent: 0 },
    { label: "W2", present: 7, halfDay: 2, absent: 0 },
    { label: "W3", present: 8, halfDay: 3, absent: 1 },
    { label: "W4", present: 9, halfDay: 2, absent: 0 },
    { label: "W5", present: 8, halfDay: 1, absent: 1 },
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
          Attendance Overview
        </Typography>

        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          size="small"
          sx={{
            height: 32,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#475569",
            borderRadius: "8px",
            bgcolor: "#F8FAFC",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
          }}
        >
          <MenuItem value="September 2026">September 2026</MenuItem>
          <MenuItem value="August 2026">August 2026</MenuItem>
        </Select>
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={2.5} alignItems="center" mb={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2563EB" }} />
          <Typography variant="caption" fontWeight={600} color="#475569">
            Present
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#F59E0B" }} />
          <Typography variant="caption" fontWeight={600} color="#475569">
            Half Day
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#EF4444" }} />
          <Typography variant="caption" fontWeight={600} color="#475569">
            Absent
          </Typography>
        </Box>
      </Stack>

      {/* Custom Bar Chart Canvas matching reference image */}
      <Box sx={{ height: 160, display: "flex", alignItems: "flex-end", position: "relative", pt: 2, pb: 1 }}>
        {/* Y-Axis Grid Lines */}
        <Box sx={{ position: "absolute", left: 24, right: 0, top: 0, bottom: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
          {[10, 8, 6, 4, 2, 0].map((val) => (
            <Box key={val} sx={{ borderTop: "1px dashed #F1F5F9", width: "100%", position: "relative" }}>
              <Typography variant="caption" color="#94A3B8" sx={{ position: "absolute", left: -24, top: -8, fontSize: "0.7rem" }}>
                {val}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Grouped Bars */}
        <Box sx={{ ml: 4, width: "100%", height: 130, display: "flex", justifyContent: "space-around", alignItems: "flex-end", zIndex: 1 }}>
          {chartWeeks.map((w, idx) => (
            <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.6, height: 110 }}>
                {/* Present Bar (Blue) */}
                <Box
                  sx={{
                    width: 12,
                    height: `${(w.present / 10) * 100}%`,
                    bgcolor: "#2563EB",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
                {/* Half Day Bar (Yellow) */}
                {w.halfDay > 0 && (
                  <Box
                    sx={{
                      width: 10,
                      height: `${(w.halfDay / 10) * 100}%`,
                      bgcolor: "#F59E0B",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                )}
                {/* Absent Bar (Red) */}
                {w.absent > 0 && (
                  <Box
                    sx={{
                      width: 10,
                      height: `${(w.absent / 10) * 100}%`,
                      bgcolor: "#EF4444",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ fontSize: "0.72rem" }}>
                {w.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Backend Action Controls */}
      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #F1F5F9", display: "flex", gap: 1.5 }}>
        {!hasCheckedIn && (
          <Button
            variant="contained"
            fullWidth
            disabled={actionLoading}
            onClick={handleCheckIn}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <Login />}
            sx={{
              py: 1,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.85rem",
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            {actionLoading ? "Checking in..." : "Check In Now"}
          </Button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <Button
            variant="contained"
            fullWidth
            disabled={actionLoading}
            onClick={handleCheckOut}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <Logout />}
            sx={{
              py: 1,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.85rem",
              bgcolor: "#EF4444",
              color: "#FFFFFF",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#DC2626" },
            }}
          >
            {actionLoading ? "Checking out..." : "Check Out Now"}
          </Button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <Box
            sx={{
              w: "100%",
              width: "100%",
              py: 1,
              px: 2,
              borderRadius: "10px",
              bgcolor: "#DCFCE7",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.8,
            }}
          >
            <CheckCircle sx={{ fontSize: 18, color: "#15803D" }} />
            <Typography variant="body2" fontWeight={700} color="#15803D">
              Shift Completed for Today
            </Typography>
          </Box>
        )}

        <IconButton size="small" onClick={fetchTodayAttendance} sx={{ border: "1px solid #E2E8F0" }}>
          <Refresh fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
