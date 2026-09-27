import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Login,
  Logout,
  CheckCircle,
} from "@mui/icons-material";
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

  // Sample weekly bar data matching reference image
  const weeklyBars = [
    { week: "W1", present: 6, halfDay: 2, absent: 0 },
    { week: "W2", present: 7, halfDay: 0, absent: 0 },
    { week: "W3", present: 8, halfDay: 0, absent: 1 },
    { week: "W4", present: 8, halfDay: 2, absent: 0 },
    { week: "W5", present: 7, halfDay: 1, absent: 0 },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(10, 22, 40, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800} color="#0A1628" sx={{ fontSize: "1.05rem" }}>
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
            borderRadius: "8px",
            bgcolor: "#F8FAFC",
            borderColor: "#E2E8F0",
            "& .MuiSelect-select": { py: 0.5, px: 1.2 },
          }}
        >
          <MenuItem value="September 2026">September 2026</MenuItem>
          <MenuItem value="August 2026">August 2026</MenuItem>
          <MenuItem value="July 2026">July 2026</MenuItem>
        </Select>
      </Box>

      {/* Legend Row */}
      <Stack direction="row" spacing={2.5} sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2563EB" }} />
          <Typography variant="caption" color="#475569" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
            Present
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#F59E0B" }} />
          <Typography variant="caption" color="#475569" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
            Half Day
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#EF4444" }} />
          <Typography variant="caption" color="#475569" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
            Absent
          </Typography>
        </Box>
      </Stack>

      {/* Bar Chart Container */}
      <Box sx={{ position: "relative", height: 170, mb: 1, px: 1 }}>
        {/* Y Axis Grid Lines */}
        {[10, 8, 6, 4, 2, 0].map((val) => (
          <Box
            key={val}
            sx={{
              position: "absolute",
              top: `${((10 - val) / 10) * 80}%`,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="#94A3B8" sx={{ width: 20, fontSize: "0.68rem" }}>
              {val}
            </Typography>
            <Box sx={{ flexGrow: 1, borderTop: "1px dashed #F1F5F9", ml: 1 }} />
          </Box>
        ))}

        {/* Vertical Grouped Bars */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 24,
            left: 30,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
          }}
        >
          {weeklyBars.map((w, idx) => (
            <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.6, height: 130 }}>
                {/* Present Bar */}
                {w.present > 0 && (
                  <Tooltip title={`Present: ${w.present} days`}>
                    <Box
                      sx={{
                        width: 12,
                        height: `${(w.present / 10) * 100}%`,
                        bgcolor: "#2563EB",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Tooltip>
                )}
                {/* Half Day Bar */}
                {w.halfDay > 0 && (
                  <Tooltip title={`Half Day: ${w.halfDay} days`}>
                    <Box
                      sx={{
                        width: 12,
                        height: `${(w.halfDay / 10) * 100}%`,
                        bgcolor: "#F59E0B",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Tooltip>
                )}
                {/* Absent Bar */}
                {w.absent > 0 && (
                  <Tooltip title={`Absent: ${w.absent} days`}>
                    <Box
                      sx={{
                        width: 12,
                        height: `${(w.absent / 10) * 100}%`,
                        bgcolor: "#EF4444",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" color="#64748B" fontWeight={600} sx={{ mt: 1, fontSize: "0.72rem" }}>
                {w.week}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Fast Check-In/Out Buttons Toolbar at bottom of card */}
      <Box sx={{ borderTop: "1px solid #F1F5F9", pt: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}>
        {!hasCheckedIn && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={actionLoading}
            onClick={handleCheckIn}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <Login fontSize="small" />}
            sx={{
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.8rem",
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            {actionLoading ? "Processing..." : "Check In Now"}
          </Button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={actionLoading}
            onClick={handleCheckOut}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <Logout fontSize="small" />}
            sx={{
              bgcolor: "#0A1628",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.8rem",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            {actionLoading ? "Processing..." : "Check Out Now"}
          </Button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography variant="caption" fontWeight={700} color="#059669" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 16 }} /> Today's Shift Logged & Completed
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
